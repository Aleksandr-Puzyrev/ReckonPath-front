import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { purchaseItemMutationOptions } from "./purchase-item-mutation";

const DROP_MS = 6 * 86_400_000;
const GRACE_MS = 10_000;

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

interface Purchase {
  target: { itemId: string } | { bundleId: string };
  expectedPrice: { emeralds: number } | { coins: number };
  idempotencyKey: string;
}

const purchase = (request: Purchase) =>
  new MutationObserver(queryClient, purchaseItemMutationOptions()).mutate(request);

const errorOf = async (request: Purchase) => {
  const error: unknown = await purchase(request).catch((rejection: unknown) => rejection);
  return error;
};

const balance = async () => (await apiClient.GET("/me")).data?.wallet;

describe("purchaseItemMutationOptions", () => {
  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("charges the price and grants the item (SHP-01)", async () => {
    const result = await purchase({
      target: { itemId: "night" },
      expectedPrice: { emeralds: 1680 },
      idempotencyKey: "k1",
    });

    expect(result.granted).toEqual(["night"]);
    expect(result.wallet).toEqual({ emeralds: 960, coins: 18420 });
  });

  test("says how much is missing (SHP-02)", async () => {
    await purchase({
      target: { itemId: "night" },
      expectedPrice: { emeralds: 1680 },
      idempotencyKey: "k1",
    });

    const error = await errorOf({
      target: { itemId: "aurora" },
      expectedPrice: { emeralds: 1800 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "INSUFFICIENT_FUNDS", details: { need: 840 } });
  });

  test("charges once for a repeat with the same key (SHP-03, SHP-04)", async () => {
    const request = {
      target: { itemId: "reef" },
      expectedPrice: { emeralds: 480 },
      idempotencyKey: "k1",
    };

    const [first, second] = await Promise.all([purchase(request), purchase(request)]);

    expect(second).toEqual(first);
    expect(await balance()).toEqual({ emeralds: 2160, coins: 18420 });
  });

  test("refuses an item that is already owned (SHP-05)", async () => {
    await purchase({
      target: { itemId: "reef" },
      expectedPrice: { emeralds: 480 },
      idempotencyKey: "k1",
    });

    const error = await errorOf({
      target: { itemId: "reef" },
      expectedPrice: { emeralds: 480 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "ALREADY_OWNED" });
  });

  test("accepts a purchase within 10 s after the window and refuses a later one (SHP-06)", async () => {
    jest.useFakeTimers({ now: Date.now() + DROP_MS + GRACE_MS - 2_000, advanceTimers: true });
    await purchase({
      target: { itemId: "pumpkin" },
      expectedPrice: { emeralds: 920 },
      idempotencyKey: "k1",
    });
    jest.setSystemTime(Date.now() + 5_000);

    const error = await errorOf({
      target: { itemId: "sparks" },
      expectedPrice: { emeralds: 1040 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "OFFER_ENDED" });
  });

  test("returns the new price when it changed", async () => {
    const error = await errorOf({
      target: { itemId: "reef" },
      expectedPrice: { emeralds: 400 },
      idempotencyKey: "k1",
    });

    expect(error).toMatchObject({ code: "PRICE_CHANGED", details: { price: { emeralds: 480 } } });
  });

  test("lowers a bundle by its owned parts and grants only the rest (SHP-08)", async () => {
    await purchase({
      target: { itemId: "creek" },
      expectedPrice: { emeralds: 1080 },
      idempotencyKey: "k1",
    });

    const result = await purchase({
      target: { bundleId: "set_storm" },
      expectedPrice: { emeralds: 456 },
      idempotencyKey: "k2",
    });

    expect(result.granted).toEqual(["fence_neon", "sparks"]);
  });

  test("refuses another body under a used key", async () => {
    await purchase({
      target: { itemId: "reef" },
      expectedPrice: { emeralds: 480 },
      idempotencyKey: "k1",
    });

    const error = await errorOf({
      target: { itemId: "garden" },
      expectedPrice: { emeralds: 520 },
      idempotencyKey: "k1",
    });

    expect(error).toMatchObject({ code: "IDEMPOTENCY_MISMATCH" });
  });
});
