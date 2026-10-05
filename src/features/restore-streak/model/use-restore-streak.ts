import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { dailyKeys } from "@entities/daily";
import { streakKeys } from "@entities/streak";
import { applyWallet, useWalletQuery } from "@entities/wallet";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { restoreStreakMutationOptions } from "../api/restore-streak-mutation";

export interface RestoreCallbacks {
  onRestored: (days: number) => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

// The restore is paid only after the server answers; nothing is charged on the device (восстановление оплачивается только после ответа сервера, на устройстве ничего не списывается).
export const useRestoreStreak = (
  price: number,
  { onRestored, onShortOfEmeralds, onError }: RestoreCallbacks,
) => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWalletQuery();
  const shortBy = Math.max(0, price - (wallet?.emeralds ?? 0));

  const { mutate, isPending } = useMutation({
    ...restoreStreakMutationOptions(),
    onSuccess: ({ streak, wallet: next }) => {
      applyWallet(queryClient, next);
      queryClient.invalidateQueries({ queryKey: streakKeys.all });
      queryClient.invalidateQueries({ queryKey: dailyKeys.all });
      onRestored(streak.current);
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "INSUFFICIENT_FUNDS") {
        onShortOfEmeralds(needOf(error.details, shortBy));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  const handleRestore = () => {
    if (shortBy > 0) {
      onShortOfEmeralds(shortBy);
      return;
    }
    mutate(uuidv7());
  };

  return { canAfford: shortBy === 0, isPending, handleRestore };
};
