import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { Price } from "../model/item-type";

type PurchaseTarget = { itemId: string } | { bundleId: string };

interface PurchaseRequest {
  target: PurchaseTarget;
  expectedPrice: Price;
  idempotencyKey: string;
}

export const purchaseItemMutationOptions = () =>
  mutationOptions({
    mutationKey: ["item", "purchase"],
    mutationFn: async ({ target, expectedPrice, idempotencyKey }: PurchaseRequest) =>
      readData(
        await apiClient.POST("/shop/purchase", {
          body: { ...target, expectedPrice },
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      ),
  });
