import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

import { inventoryOf } from "../model/inventory-of";
import { shopOf } from "../model/shop-of";

const SHOP_STALE_MS = 300_000;
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
    queryFn: async () => shopOf(readData(await apiClient.GET("/shop"))),
    staleTime: SHOP_STALE_MS,
  });

export const inventoryQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.inventory(),
    queryFn: async () => inventoryOf(readData(await apiClient.GET("/me/items"))),
    staleTime: INVENTORY_STALE_MS,
  });

export const useShopQuery = () => useQuery({ ...shopQueryOptions(), enabled: useHasAccount() });

export const useInventoryQuery = () =>
  useQuery({ ...inventoryQueryOptions(), enabled: useHasAccount() });
