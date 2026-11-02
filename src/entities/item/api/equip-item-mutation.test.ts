import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import type { Slot } from "../model/item-type";

import { equipItemMutationOptions } from "./equip-item-mutation";

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

const equip = (slot: Slot, itemId: string | null) =>
  new MutationObserver(queryClient, equipItemMutationOptions()).mutate({ slot, itemId });

const buy = (key: string, gems: number) =>
  apiClient.POST("/shop/items/{key}/buy", {
    params: { path: { key } },
    body: { price: gems, currency: "gems" },
  });

describe("equipItemMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("equips an owned item by its backend kind and returns the inventory", async () => {
    await buy("reef", 480);

    const inventory = await equip("field", "reef");

    expect(inventory.loadout).toEqual({ field: "reef" });
    expect((await apiClient.GET("/me/items")).data?.equipped).toMatchObject({ board: "reef" });
  });

  test("puts the default item back with an empty item", async () => {
    await buy("reef", 480);
    await equip("field", "reef");

    const inventory = await equip("field", null);

    expect(inventory.loadout).toEqual({});
  });

  test("equips a slot the client added for the backend (decision 0055 #2)", async () => {
    await buy("buoy_glow", 600);

    const inventory = await equip("buoy", "buoy_glow");

    expect(inventory.loadout).toEqual({ buoy: "buoy_glow" });
  });

  test("refuses an item that is not owned", async () => {
    const error: unknown = await equip("field", "aurora").catch((rejection: unknown) => rejection);

    expect(error).toMatchObject({ code: "validation_failed" });
  });

  test("refuses an owned item in another slot", async () => {
    await buy("reef", 480);

    const error: unknown = await equip("frame", "reef").catch((rejection: unknown) => rejection);

    expect(error).toMatchObject({ code: "validation_failed" });
  });
});
