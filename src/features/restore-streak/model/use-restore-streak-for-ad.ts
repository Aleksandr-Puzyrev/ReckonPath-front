import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import { adKeys, watchRewardedAd } from "@entities/ad";
import { dailyKeys } from "@entities/daily";
import { streakKeys } from "@entities/streak";
import { applyWallet } from "@entities/wallet";
import { apiClient, errorMessageKey, readData, useIsOnline } from "@shared/api";

import type { RestoreCallbacks } from "./use-restore-streak";

export type RestoreAdState = "ready" | "loading" | "unavailable" | "offline";

// The ad pays for the right to restore; the streak comes back only with the server's answer (реклама оплачивает право восстановить; серия возвращается только с ответом сервера).
const restoreForAd = async () => {
  const outcome = await watchRewardedAd("streak");
  if (outcome.kind !== "rewarded") return null;
  return readData(
    await apiClient.POST("/streak/restore", {
      body: { method: "ad", adIntentId: outcome.adIntentId },
      headers: { "Idempotency-Key": uuidv7() },
    }),
  );
};

export const useRestoreStreakForAd = ({
  onRestored,
  onError,
}: Pick<RestoreCallbacks, "onRestored" | "onError">) => {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const [isUnavailable, setIsUnavailable] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["streak", "restore", "ad"],
    mutationFn: restoreForAd,
    networkMode: "always",
    onSuccess: (restored) => {
      void queryClient.invalidateQueries({ queryKey: adKeys.limits() });
      if (restored === null) {
        setIsUnavailable(true);
        onError("ads.unavailable");
        return;
      }
      applyWallet(queryClient, restored.wallet);
      void queryClient.invalidateQueries({ queryKey: streakKeys.all });
      void queryClient.invalidateQueries({ queryKey: dailyKeys.all });
      onRestored(restored.streak.current);
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  const state = (): RestoreAdState => {
    if (!isOnline) return "offline";
    if (isPending) return "loading";
    return isUnavailable ? "unavailable" : "ready";
  };

  return {
    state: state(),
    handlePress: () => {
      setIsUnavailable(false);
      mutate();
    },
  };
};
