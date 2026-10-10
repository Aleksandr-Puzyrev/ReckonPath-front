import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { shopQueryOptions } from "@entities/item";
import { apiClient } from "@shared/api";
import { meQueryOptions } from "@entities/wallet";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useEquipItem } from "./use-equip-item";

let queryClient = new QueryClient();

const callbacks = () => ({ onEquipped: jest.fn(), onError: jest.fn() });

const renderEquip = async (handlers: ReturnType<typeof callbacks>) => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  await queryClient.fetchQuery(shopQueryOptions());
  await queryClient.fetchQuery(meQueryOptions());
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEquipItem(handlers), { wrapper });
};

const isEquipped = (id: string) =>
  queryClient
    .getQueryData(shopQueryOptions().queryKey)
    ?.tabs.flatMap(({ items }) => items)
    .find((item) => item.id === id)?.equipped;

const buy = (itemId: string, emeralds: number) =>
  apiClient.POST("/shop/purchase", { body: { itemId, expectedPrice: { emeralds } } });

describe("useEquipItem", () => {
  afterEach(async () => {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    mockServer.reset();
  });

  test("marks the item equipped at once and confirms by the server", async () => {
    await buy("reef", 480);
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.equip([{ id: "reef", slot: "field" }], "Коралловый риф"));

    expect(isEquipped("reef")).toBe(true);
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.loadout.field).toBe("reef");
    await waitFor(() => expect(handlers.onEquipped).toHaveBeenCalledWith("Коралловый риф"));
  });

  test("equips every part of a bundle at once", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { bundleId: "set_garden", expectedPrice: { emeralds: 560 } },
    });
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () =>
      result.current.equip(
        [
          { id: "garden", slot: "field" },
          { id: "marker_gold", slot: "target" },
        ],
        "Набор «Сад»",
      ),
    );

    await waitFor(() => expect(handlers.onEquipped).toHaveBeenCalled());
    expect((await apiClient.GET("/me")).data?.loadout).toMatchObject({
      field: "garden",
      target: "marker_gold",
    });
  });

  test("rolls back and reports a refused equip", async () => {
    mockServer.use(
      http.put(mockUrl("/loadout"), () =>
        HttpResponse.json({ error: { code: "NOT_OWNED" } }, { status: 422 }),
      ),
    );
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.equip([{ id: "reef", slot: "field" }], "Коралловый риф"));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.generic"));
    expect(isEquipped("reef")).toBe(false);
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.loadout.field).toBeUndefined();
  });

  test("puts the default item back with null", async () => {
    await buy("reef", 480);
    await apiClient.PUT("/loadout", { body: { field: "reef" } });
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.reset("field", "По умолчанию"));

    expect(isEquipped("reef")).toBe(false);
    await waitFor(() => expect(handlers.onEquipped).toHaveBeenCalledWith("По умолчанию"));
    expect((await apiClient.GET("/me")).data?.loadout.field).toBeNull();
  });
});
