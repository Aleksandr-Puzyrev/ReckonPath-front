import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import {
  amountOf,
  currencyOf,
  isPrice,
  itemKeys,
  purchaseItemMutationOptions,
} from "@entities/item";
import type { Currency, Price } from "@entities/item";
import { useAccountStore } from "@entities/session";
import { applyWallet, useWalletQuery } from "@entities/wallet";
import { errorMessageKey, isApiError, retryDelay, shouldRetry } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { PURCHASE_CONFIRM_FROM_EMERALDS } from "@shared/config";

export type PurchaseTarget = { itemId: string } | { bundleId: string };
export type EndedReason = "OFFER_ENDED" | "SOLD_OUT";

export interface PurchaseCallbacks {
  onShortOf: (amount: number, currency: Currency) => void;
  onPurchased: () => void;
  onOwned: () => void;
  onEnded: (reason: EndedReason) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

export const usePurchaseItem = (
  target: PurchaseTarget,
  price: Price,
  { onShortOf, onPurchased, onOwned, onEnded, onError }: PurchaseCallbacks,
) => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWalletQuery();
  const [changedPrice, setChangedPrice] = useState<Price | null>(null);
  const [isRepriced, setIsRepriced] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const currentPrice = changedPrice ?? price;
  const currency = currencyOf(currentPrice);
  const amount = amountOf(currentPrice);
  const shortBy = Math.max(0, amount - (wallet?.[currency] ?? 0));

  const refreshShop = () => queryClient.invalidateQueries({ queryKey: itemKeys.all });

  const { mutate, isPending } = useMutation({
    ...purchaseItemMutationOptions(),
    // The request is sent at once offline too, so a lost connection fails and is retried with the same key (запрос уходит сразу и без сети, поэтому обрыв даёт ошибку и повтор с тем же ключом).
    networkMode: "always",
    retry: shouldRetry,
    retryDelay,
    onSuccess: ({ wallet: next }) => {
      applyWallet(queryClient, next);
      void refreshShop();
      onPurchased();
    },
    onError: (error) => {
      const code = isApiError(error) ? error.code : null;
      const details = isApiError(error) ? error.details : {};
      if (code === "INSUFFICIENT_FUNDS") {
        onShortOf(needOf(details, shortBy), currency);
        return;
      }
      if (code === "ALREADY_OWNED") {
        void refreshShop();
        onOwned();
        return;
      }
      if (code === "OFFER_ENDED" || code === "SOLD_OUT") {
        void refreshShop();
        onEnded(code);
        return;
      }
      if (code === "PRICE_CHANGED" && isPrice(details.price)) {
        setChangedPrice(details.price);
        setIsRepriced(true);
        onError(errorMessageKey(error));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  // One key per player action: retries of this purchase reuse it (один ключ на действие игрока: повторы этой покупки используют его).
  const purchase = () => mutate({ target, expectedPrice: currentPrice, idempotencyKey: uuidv7() });

  const handleBuy = () => {
    if (shortBy > 0) {
      onShortOf(shortBy, currency);
      return;
    }
    if (currency === "emeralds" && useAccountStore.getState().requestPurchaseOffer()) return;
    const needsConfirm =
      isRepriced || (currency === "emeralds" && amount >= PURCHASE_CONFIRM_FROM_EMERALDS);
    if (needsConfirm) {
      setIsConfirming(true);
      return;
    }
    purchase();
  };

  const handleConfirm = () => {
    setIsConfirming(false);
    setIsRepriced(false);
    purchase();
  };

  return {
    price: currentPrice,
    balanceAfter: (wallet?.[currency] ?? 0) - amount,
    isConfirming,
    isPending,
    handleBuy,
    handleConfirm,
    handleCancelConfirm: () => setIsConfirming(false),
  };
};
