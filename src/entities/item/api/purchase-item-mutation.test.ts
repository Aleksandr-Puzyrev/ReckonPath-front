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
  key: string;
  expectedPrice: { emeralds: number } | { coins: number };
  idempotencyKey: string;
}

const purchase = (request: Purchase) =>
  new MutationObserver(queryClient, purchaseItemMutationOptions()).mutate(request);

const errorOf = async (request: Purchase) => {
  const error: unknown = await purchase(request).catch((rejection: unknown) => rejection);
  return error;
};

const balance = async () => (await apiClient.GET("/wallet")).data;

const ownedKeys = async () =>
  (await apiClient.GET("/me/items")).data?.items.map(({ key }) => key) ?? [];

describe("purchaseItemMutationOptions", () => {
  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("sends the seen price in gems and returns the wallet in emeralds (SHP-01)", async () => {
    const result = await purchase({
      key: "night",
      expectedPrice: { emeralds: 1680 },
      idempotencyKey: "k1",
    });

    expect(result.wallet).toEqual({ emeralds: 960, coins: 18420 });
    expect(await ownedKeys()).toContain("night");
  });

  test("buys for coins", async () => {
    const result = await purchase({
      key: "fence_neon",
      expectedPrice: { coins: 4200 },
      idempotencyKey: "k1",
    });

    expect(result.wallet).toEqual({ emeralds: 2640, coins: 14220 });
  });

  test("says how much is missing (SHP-02)", async () => {
    await purchase({ key: "night", expectedPrice: { emeralds: 1680 }, idempotencyKey: "k1" });

    const error = await errorOf({
      key: "aurora",
      expectedPrice: { emeralds: 1800 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "not_enough_gems", details: { need: 840 } });
  });

  test("charges once for a repeat with the same key (SHP-03, SHP-04)", async () => {
    const request = { key: "reef", expectedPrice: { emeralds: 480 }, idempotencyKey: "k1" };

    const [first, second] = await Promise.all([purchase(request), purchase(request)]);

    expect(second).toEqual(first);
    expect(await balance()).toEqual({ gems: 2160, coins: 18420 });
  });

  test("refuses an item that is already owned (SHP-05)", async () => {
    await purchase({ key: "reef", expectedPrice: { emeralds: 480 }, idempotencyKey: "k1" });

    const error = await errorOf({
      key: "reef",
      expectedPrice: { emeralds: 480 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "already_owned" });
  });

  test("accepts a purchase within 10 s after the window and refuses a later one (SHP-06)", async () => {
    jest.useFakeTimers({ now: Date.now() + DROP_MS + GRACE_MS - 2_000, advanceTimers: true });
    await purchase({ key: "pumpkin", expectedPrice: { emeralds: 920 }, idempotencyKey: "k1" });
    jest.setSystemTime(Date.now() + 5_000);

    const error = await errorOf({
      key: "sparks",
      expectedPrice: { emeralds: 1040 },
      idempotencyKey: "k2",
    });

    expect(error).toMatchObject({ code: "offer_ended" });
  });

  test("returns the new price when it changed", async () => {
    const error = await errorOf({
      key: "reef",
      expectedPrice: { emeralds: 400 },
      idempotencyKey: "k1",
    });

    expect(error).toMatchObject({
      code: "price_changed",
      details: { price: 480, currency: "gems" },
    });
  });

  test("lowers a bundle by its owned parts and grants only the rest (SHP-08)", async () => {
    await purchase({ key: "creek", expectedPrice: { emeralds: 1080 }, idempotencyKey: "k1" });

    await purchase({ key: "set_storm", expectedPrice: { emeralds: 456 }, idempotencyKey: "k2" });

    expect(await ownedKeys()).toEqual(expect.arrayContaining(["creek", "fence_neon", "sparks"]));
  });

  test("refuses an unknown item", async () => {
    const error = await errorOf({
      key: "missing",
      expectedPrice: { emeralds: 1 },
      idempotencyKey: "k1",
    });

    expect(error).toMatchObject({ code: "item_not_found" });
  });

  test("refuses another body under a used key", async () => {
    await purchase({ key: "reef", expectedPrice: { emeralds: 480 }, idempotencyKey: "k1" });

    const error = await errorOf({
      key: "garden",
      expectedPrice: { emeralds: 520 },
      idempotencyKey: "k1",
    });

    expect(error).toMatchObject({ code: "idempotency_mismatch" });
  });
});
