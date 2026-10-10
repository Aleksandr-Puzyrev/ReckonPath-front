import { cleanup, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";
import skins from "@shared/api/mocks/mock-skins.json";

import skin from "./default-skin.json";
import { useBoardSkin } from "./use-board-skin";

const buyAndEquip = async (
  itemId: string,
  price: { emeralds: number } | { coins: number },
  slot: string,
) => {
  await apiClient.POST("/shop/purchase", { body: { itemId, expectedPrice: price } });
  await apiClient.PUT("/loadout", { body: { [slot]: itemId } });
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

  test("wears the equipped board skin (SHP-10)", async () => {
    await buyAndEquip("reef", { emeralds: 480 }, "field");

    const { result } = await renderHook(() => useBoardSkin(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.frame).toEqual(skins.reef.dark.frame.gradient));
    expect(result.current.cell).toEqual(skins.reef.dark.cell.stops);
  });

  test("recolours an element by its equipped skin", async () => {
    await buyAndEquip("fence_neon", { coins: 4200 }, "fence");

    const { result } = await renderHook(() => useBoardSkin(), { wrapper: createQueryWrapper() });

    await waitFor(() =>
      expect(result.current.elements.fence).toBe(skins.fence_neon.dark.elements.fence),
    );
  });

  test("keeps the default skin when the skin cannot load (SHP-11)", async () => {
    await buyAndEquip("reef", { emeralds: 480 }, "field");
    mockServer.use(http.get("*/cdn/skins/:file", () => HttpResponse.error()));

    const { result } = await renderHook(() => useBoardSkin(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.frame).toEqual(skin.dark.frame));
  });

  test("wears a given package in a given theme for a preview", async () => {
    const shop = await apiClient.GET("/shop");
    const url = shop.data?.tabs.flatMap(({ items }) => items).find(({ id }) => id === "aurora")
      ?.package.url;

    const { result } = await renderHook(
      () => useBoardSkin({ packageUrl: url ?? null, theme: "light" }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.frame).toEqual(skins.aurora.light.frame.gradient));
  });
});
