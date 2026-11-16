import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { useTranslation } from "react-i18next";

import { arenaKeys } from "@entities/arena";
import { arenaMapKeys } from "@entities/arena-map";
import { matchKeys, useMatchDetailsQuery, useMatchStore } from "@entities/match";
import { walletKeys } from "@entities/wallet";
import { useInterstitial } from "@features/show-interstitial";
import { haptic } from "@shared/haptics";
import { useFindMatch } from "@widgets/find-match";

export type ZoomedMap = "mine" | "theirs" | null;

export const useArenaResult = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const stored = useMatchStore((state) =>
    state.view?.id === id && state.view.status === "done" ? state.view : null,
  );
  const details = useMatchDetailsQuery(id);
  const match = stored ?? details.data ?? null;
  const interstitial = useInterstitial();
  const find = useFindMatch({ onError: (messageKey) => onToast(t(messageKey)), isReplacing: true });
  const [zoomed, setZoomed] = useState<ZoomedMap>(null);
  const [isPromotionClosed, setIsPromotionClosed] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const outcome = match?.result?.outcome;

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: arenaKeys.all });
    void queryClient.invalidateQueries({ queryKey: arenaMapKeys.all });
    void queryClient.invalidateQueries({ queryKey: matchKeys.history() });
    void queryClient.invalidateQueries({ queryKey: walletKeys.all });
  }, [queryClient]);

  useEffect(() => {
    if (outcome === "win") haptic("success");
    else if (outcome === "loss") haptic("warning");
  }, [outcome]);

  // A finished match counts towards the interstitial like a finished level (Part 1 §6.5) (завершённый матч считается для межстраничной рекламы как пройденный уровень).
  const leaveWith = async (next: () => void) => {
    if (isLeaving) return;
    setIsLeaving(true);
    interstitial.finishLevel();
    await interstitial.showIfDue();
    useMatchStore.getState().reset();
    next();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      void leaveWith(() => router.back());
      return true;
    });
    return () => subscription.remove();
  });

  return {
    match,
    isFailed: details.isError && stored === null,
    zoomed,
    promotion: isPromotionClosed ? null : (match?.result?.promotion ?? null),
    handleZoom: setZoomed,
    handleRetry: () => void details.refetch(),
    handlePromotionClose: () => setIsPromotionClosed(true),
    handleArena: () => void leaveWith(() => router.back()),
    handleAgain: () => void leaveWith(find.handleFight),
  };
};
