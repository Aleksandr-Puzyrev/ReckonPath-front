import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import { adKeys, useAdLimitsQuery, watchRewardedAd } from "@entities/ad";
import type { AdMessageKey } from "@entities/ad";
import { useGameSessionStore } from "@entities/level";
import { apiClient, errorMessageKey, isApiError, readData, useIsOnline } from "@shared/api";
import { haptic } from "@shared/haptics";

export type AdButtonState = "ready" | "loading" | "unavailable" | "offline" | "limit";

export interface ContinueForAdCallbacks {
  onContinued: () => void;
  onMessage: (messageKey: AdMessageKey) => void;
}

// The ad pays for the right to continue; the moves come only from the server's answer (реклама оплачивает право продолжить; ходы приходят только из ответа сервера).
const continueForAd = async (attemptId: string) => {
  const outcome = await watchRewardedAd("continue", attemptId);
  if (outcome.kind !== "rewarded") return false;
  readData(
    await apiClient.POST("/continue", {
      body: { attemptId, method: "ad", adIntentId: outcome.adIntentId },
      headers: { "Idempotency-Key": uuidv7() },
    }),
  );
  return true;
};

export const useContinueForAd = ({ onContinued, onMessage }: ContinueForAdCallbacks) => {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const { data: limits } = useAdLimitsQuery();
  const [isUnavailable, setIsUnavailable] = useState(false);
  const left = limits === undefined ? null : limits.continue.max - limits.continue.used;

  const { mutate, isPending } = useMutation({
    mutationKey: ["continue", "ad"],
    mutationFn: continueForAd,
    networkMode: "always",
    onSuccess: (isContinued) => {
      void queryClient.invalidateQueries({ queryKey: adKeys.limits() });
      if (!isContinued) {
        setIsUnavailable(true);
        onMessage("ads.unavailable");
        return;
      }
      useGameSessionStore.getState().continueGame("ad");
      haptic("success");
      onContinued();
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: adKeys.limits() });
      if (isApiError(error) && error.code === "LIMIT_REACHED") return;
      onMessage(errorMessageKey(error));
    },
  });

  const state = (): AdButtonState => {
    if (left !== null && left <= 0) return "limit";
    if (!isOnline) return "offline";
    if (isPending) return "loading";
    return isUnavailable ? "unavailable" : "ready";
  };

  const handlePress = () => {
    const { attemptId } = useGameSessionStore.getState();
    if (attemptId === null) {
      onMessage("errors.generic");
      return;
    }
    setIsUnavailable(false);
    mutate(attemptId);
  };

  return { state: state(), left, handlePress };
};
