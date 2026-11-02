import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { inventoryQueryOptions, shopQueryOptions } from "@entities/item";
import { apiClient } from "@shared/api";
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
  await queryClient.fetchQuery(inventoryQueryOptions());
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

const loadout = () => queryClient.getQueryData(inventoryQueryOptions().queryKey)?.loadout;

const buy = (key: string, gems: number) =>
  apiClient.POST("/shop/items/{key}/buy", {
    params: { path: { key } },
    body: { price: gems, currency: "gems" },
  });

const equippedOnServer = async () => (await apiClient.GET("/me/items")).data?.equipped;

describe("useEquipItem", () => {
  afterEach(async () => {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    mockServer.reset();
  });

  test("marks the item equipped at once and confirms by the server", async () => {
    await buy("reef", 480);
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.equip({ id: "reef", slot: "field" }, "Коралловый риф"));

    expect(isEquipped("reef")).toBe(true);
    expect(loadout()?.field).toBe("reef");
    await waitFor(() => expect(handlers.onEquipped).toHaveBeenCalledWith("Коралловый риф"));
    expect(await equippedOnServer()).toMatchObject({ board: "reef" });
  });

  test("rolls back and reports a refused equip", async () => {
    mockServer.use(
      http.put(mockUrl("/me/equipment"), () =>
        HttpResponse.json({ error: { code: "validation_failed" } }, { status: 422 }),
      ),
    );
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.equip({ id: "reef", slot: "field" }, "Коралловый риф"));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.generic"));
    expect(isEquipped("reef")).toBe(false);
    expect(loadout()?.field).toBeUndefined();
  });

  test("puts the default item back", async () => {
    await buy("reef", 480);
    await apiClient.PUT("/me/equipment", { body: { slot: "board", item: "reef" } });
    const handlers = callbacks();
    const { result } = await renderEquip(handlers);

    await act(async () => result.current.reset("field", "По умолчанию"));

    expect(isEquipped("reef")).toBe(false);
    expect(loadout()?.field).toBeUndefined();
    await waitFor(() => expect(handlers.onEquipped).toHaveBeenCalledWith("По умолчанию"));
    expect(await equippedOnServer()).toMatchObject({ board: "" });
  });
});
