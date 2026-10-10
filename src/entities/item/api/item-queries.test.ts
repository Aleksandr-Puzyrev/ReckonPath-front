import { QueryClient } from "@tanstack/react-query";
import { http } from "msw/http";

import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { inventoryQueryOptions, shopQueryOptions } from "./item-queries";

const createClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

const watchShopRequests = () => {
  const counter = { count: 0 };
  mockServer.use(
    http.get(mockUrl("/shop"), () => {
      counter.count += 1;
      return undefined;
    }),
  );
  return counter;
};

const buy = (itemId: string, emeralds: number) =>
  apiClient.POST("/shop/purchase", { body: { itemId, expectedPrice: { emeralds } } });

describe("shopQueryOptions", () => {
  beforeEach(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("loads the catalog with tabs in the shop order and the featured drop", async () => {
    const shop = await createClient().fetchQuery(shopQueryOptions());

    expect(shop.tabs.map(({ id }) => id)).toEqual([
      "exclusive",
      "holiday",
      "elements",
      "fields",
      "profile",
      "effects",
    ]);
    expect(shop.featured?.target).toEqual({ bundle: "set_storm" });
    expect(shop.bundles.map(({ id }) => id)).toEqual(["set_storm", "set_garden"]);
  });

  test("names items in the player's language", async () => {
    await i18n.changeLanguage("en");

    const shop = await createClient().fetchQuery(shopQueryOptions());

    expect(shop.tabs[0]?.items[0]?.name).toBe("Night signal");
  });

  test("marks a bought item as owned", async () => {
    await buy("reef", 480);

    const shop = await createClient().fetchQuery(shopQueryOptions());

    const reef = shop.tabs.flatMap(({ items }) => items).find(({ id }) => id === "reef");
    expect(reef?.owned).toBe(true);
  });

  test("stays fresh for the time the server gives", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const requests = watchShopRequests();
    const client = createClient();
    await client.fetchQuery(shopQueryOptions());

    jest.setSystemTime(Date.now() + 299_000);
    await client.fetchQuery(shopQueryOptions());
    expect(requests.count).toBe(1);

    jest.setSystemTime(Date.now() + 2_000);
    await client.fetchQuery(shopQueryOptions());
    expect(requests.count).toBe(2);
    jest.useRealTimers();
  });
});

describe("inventoryQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("describes owned items, so the collection can show ended offers", async () => {
    await buy("night", 1680);

    const { items } = await createClient().fetchQuery(inventoryQueryOptions());

    expect(items).toEqual([
      expect.objectContaining({
        itemId: "night",
        slot: "field",
        source: "shop",
        item: expect.objectContaining({ type: "FIELD", rarity: "legendary" }),
      }),
    ]);
  });
});
