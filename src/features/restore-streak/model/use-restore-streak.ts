import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import type { AdMessageKey } from "@entities/ad";
import { dailyKeys } from "@entities/daily";
import { streakKeys } from "@entities/streak";
import { useWalletQuery, walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError, isInsufficientFunds } from "@shared/api";

import { restoreStreakMutationOptions } from "../api/restore-streak-mutation";

export interface RestoreCallbacks {
  onRestored: (days: number) => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: AdMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

// The restore is paid only on the server; the streak comes in its answer, the balance with a fresh /wallet (восстановление оплачивается только на сервере; серия приходит в его ответе, баланс — со свежим /wallet).
export const useRestoreStreak = (
  price: number,
  { onRestored, onShortOfEmeralds, onError }: RestoreCallbacks,
) => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWalletQuery();
  const shortBy = Math.max(0, price - (wallet?.emeralds ?? 0));

  const { mutate, isPending } = useMutation({
    ...restoreStreakMutationOptions(),
    onSuccess: (streak) => {
      queryClient.setQueryData(streakKeys.all, streak);
      void queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
      void queryClient.invalidateQueries({ queryKey: dailyKeys.overview() });
      onRestored(streak.current);
    },
    onError: (error) => {
      if (isApiError(error) && isInsufficientFunds(error.code)) {
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
