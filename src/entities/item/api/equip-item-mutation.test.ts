import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import type { Loadout } from "../model/item-type";

import { equipItemMutationOptions } from "./equip-item-mutation";

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

const equip = (change: Loadout) =>
  new MutationObserver(queryClient, equipItemMutationOptions()).mutate(change);

const buy = (itemId: string, emeralds: number) =>
  apiClient.POST("/shop/purchase", { body: { itemId, expectedPrice: { emeralds } } });

describe("equipItemMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("equips an owned item and returns the whole loadout", async () => {
    await buy("reef", 480);

    const loadout = await equip({ field: "reef" });

    expect(loadout).toEqual({ field: "reef" });
    expect((await apiClient.GET("/me")).data?.loadout).toEqual({ field: "reef" });
  });

  test("puts the default item back with null", async () => {
    await buy("reef", 480);
    await equip({ field: "reef" });

    const loadout = await equip({ field: null });

    expect(loadout).toEqual({ field: null });
  });

  test("refuses an item that is not owned", async () => {
    const error: unknown = await equip({ field: "aurora" }).catch(
      (rejection: unknown) => rejection,
    );

    expect(error).toMatchObject({ code: "NOT_OWNED" });
  });

  test("refuses an owned item in another slot", async () => {
    await buy("reef", 480);

    const error: unknown = await equip({ frame: "reef" }).catch((rejection: unknown) => rejection);

    expect(error).toMatchObject({ code: "NOT_OWNED" });
  });

  test("refuses more than three badges", async () => {
    const error: unknown = await equip({ badges: ["a", "b", "c", "d"] }).catch(
      (rejection: unknown) => rejection,
    );

    expect(error).toMatchObject({ code: "VALIDATION" });
  });
});
