import { apiClient } from "../api";
import type { components } from "../api";

export const buyMockItem = (key: string, price: { emeralds: number } | { coins: number }) =>
  apiClient.POST("/shop/items/{key}/buy", {
    params: { path: { key } },
    body:
      "emeralds" in price
        ? { price: price.emeralds, currency: "gems" }
        : { price: price.coins, currency: "coins" },
  });

export const equipMockItem = (kind: components["schemas"]["ShopKind"], key: string) =>
  apiClient.PUT("/me/equipment", { body: { slot: kind, item: key } });
