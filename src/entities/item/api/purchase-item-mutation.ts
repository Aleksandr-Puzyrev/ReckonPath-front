import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import { backendPriceOf } from "../model/backend-price";
import type { Price } from "../model/item-type";

interface PurchaseRequest {
  key: string;
  expectedPrice: Price;
  idempotencyKey: string;
}

export const purchaseItemMutationOptions = () =>
  mutationOptions({
    mutationKey: ["item", "purchase"],
    mutationFn: async ({ key, expectedPrice, idempotencyKey }: PurchaseRequest) => {
      const { wallet } = readData(
        await apiClient.POST("/shop/items/{key}/buy", {
          params: { path: { key } },
          body: backendPriceOf(expectedPrice),
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      );
      return { wallet: { emeralds: wallet.gems, coins: wallet.coins } };
    },
  });
