import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { inventoryQueryOptions } from "@entities/item";
import type { Inventory } from "@entities/item";
import { MOCK_API_ORIGIN } from "@shared/api/mocks/mock-url";
import skins from "@shared/api/mocks/mock-skins.json";
import { mockServer } from "@shared/test-utils/api-mock";
import { buyMockItem, equipMockItem } from "@shared/test-utils/buy-mock-item";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import skin from "./default-skin.json";
import { useBoardSkin } from "./use-board-skin";

const skinUrlOf = (id: string) => `${MOCK_API_ORIGIN}/cdn/skins/${id}.json`;

const wearing = (itemId: string, slot: "field" | "fence"): Inventory => ({
  items: [
    {
      itemId,
      slot,
      item: {
        name: itemId,
        description: "",
        rarity: "rare",
        preview: "",
        skinUrl: skinUrlOf(itemId),
      },
    },
  ],
  loadout: { [slot]: itemId },
});

// The backend gives no skin packages yet (decision 0054 #1), so an equipped skin is put in the cache (бэкенд пока не отдаёт пакеты скинов, поэтому надетый скин кладётся в кэш).
const renderWearing = (inventory: Inventory) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  queryClient.setQueryData(inventoryQueryOptions().queryKey, inventory);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useBoardSkin(), { wrapper });
};

describe("useBoardSkin", () => {
  // Unmounted first, so the queries still loading cannot update it after the test (сначала размонтируется, чтобы ещё идущие запросы не обновили хук после теста).
  afterEach(async () => {
    await cleanup();
    mockServer.reset();
  });

  test("wears the default skin with nothing equipped", async () => {
    const { result } = await renderHook(() => useBoardSkin(), { wrapper: createQueryWrapper() });

    expect(result.current.frame).toEqual(skin.dark.frame);
  });

  test("keeps the default skin for a backend item without palettes (decision 0054 #1)", async () => {
    await buyMockItem("reef", { emeralds: 480 });
    await equipMockItem("board", "reef");

    const { result } = await renderHook(() => useBoardSkin(), { wrapper: createQueryWrapper() });

    expect(result.current.frame).toEqual(skin.dark.frame);
  });

  test("wears the equipped board skin (SHP-10)", async () => {
    const { result } = await renderWearing(wearing("reef", "field"));

    await waitFor(() => expect(result.current.frame).toEqual(skins.reef.dark.frame.gradient));
    expect(result.current.cell).toEqual(skins.reef.dark.cell.stops);
  });

  test("recolours an element by its equipped skin", async () => {
    const { result } = await renderWearing(wearing("fence_neon", "fence"));

    await waitFor(() =>
      expect(result.current.elements.fence).toBe(skins.fence_neon.dark.elements.fence),
    );
  });

  test("keeps the default skin when the skin cannot load (SHP-11)", async () => {
    mockServer.use(http.get("*/cdn/skins/:file", () => HttpResponse.error()));

    const { result } = await renderWearing(wearing("reef", "field"));

    await waitFor(() => expect(result.current.frame).toEqual(skin.dark.frame));
  });

  test("wears a given package in a given theme for a preview", async () => {
    const { result } = await renderHook(
      () => useBoardSkin({ packageUrl: skinUrlOf("aurora"), theme: "light" }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.frame).toEqual(skins.aurora.light.frame.gradient));
  });
});
