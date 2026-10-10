import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

const MS_PER_SECOND = 1000;
const SHOP_STALE_FALLBACK_SEC = 300;
const INVENTORY_STALE_MS = 60_000;

export const itemKeys = {
  all: ["item"] as const,
  shop: () => [...itemKeys.all, "shop"] as const,
  inventory: () => [...itemKeys.all, "inventory"] as const,
  // Outside the item prefix: refreshing the shop after an equip must not refetch loaded skins (вне префикса item: обновление витрины после экипировки не должно перезагружать загруженные скины).
  skin: (url: string) => ["skin", url] as const,
};

export const shopQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.shop(),
    queryFn: async () => readData(await apiClient.GET("/shop")),
    // The server says how long the catalog stays fresh (сервер сам сообщает, сколько каталог остаётся свежим).
    staleTime: ({ state }) => (state.data?.cacheTtlSec ?? SHOP_STALE_FALLBACK_SEC) * MS_PER_SECOND,
  });

export const inventoryQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.inventory(),
    queryFn: async () => readData(await apiClient.GET("/inventory")),
    staleTime: INVENTORY_STALE_MS,
  });

export const useShopQuery = () => useQuery(shopQueryOptions());

export const useInventoryQuery = () => useQuery(inventoryQueryOptions());
