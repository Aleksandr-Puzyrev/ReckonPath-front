import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import { adKeys, useAdLimitsQuery, watchGuestRewardedAd, watchRewardedAd } from "@entities/ad";
import type { AdMessageKey } from "@entities/ad";
import { dayKeyOf } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useAccountStore } from "@entities/session";
import { apiClient, errorMessageKey, isApiError, readData, useIsOnline } from "@shared/api";
import { CONTINUE_ADS_PER_DAY, GUEST_REWARDED_UNIT_ID } from "@shared/config";
import { haptic } from "@shared/haptics";

import { useGuestAdContinueStore } from "./guest-ad-continue-store";

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

const continueForGuestAd = async () => {
  const isWatched = await watchGuestRewardedAd(GUEST_REWARDED_UNIT_ID);
  if (isWatched) useGuestAdContinueStore.getState().countUse(dayKeyOf(Date.now()));
  return isWatched;
};

export const useContinueForAd = ({ onContinued, onMessage }: ContinueForAdCallbacks) => {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const { data: limits } = useAdLimitsQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const guestUsed = useGuestAdContinueStore((state) => state.usedOn(dayKeyOf(Date.now())));
  const [isUnavailable, setIsUnavailable] = useState(false);
  const serverLeft = limits === undefined ? null : limits.continue.max - limits.continue.used;
  const left = hasLogin ? serverLeft : CONTINUE_ADS_PER_DAY - guestUsed;

  const { mutate, isPending } = useMutation({
    mutationKey: ["continue", "ad"],
    mutationFn: (attemptId: string) => (hasLogin ? continueForAd(attemptId) : continueForGuestAd()),
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
      if (isApiError(error) && error.code === "limit_reached") return;
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
