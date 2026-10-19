import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { arenaKeys, useArenaQuery } from "@entities/arena";
import { useArenaMapsQuery } from "@entities/arena-map";
import { matchKeys, matchSession, useMatchStore } from "@entities/match";
import { walletKeys } from "@entities/wallet";
import { useInterstitial } from "@features/show-interstitial";
import type { ErrorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";
import { useFindMatch } from "@widgets/find-match";

export type ZoomedMap = "mine" | "theirs" | null;

export const useArenaResult = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  // The screen keeps the finished match: «Ещё бой» resets the session before its checks may still need the screen (экран хранит завершённый матч: «Ещё бой» сбрасывает сессию до того, как его проверкам может ещё понадобиться экран).
  const [match] = useState(() => {
    const { end, opponent, layout, myTaps, opponentTaps, format } = useMatchStore.getState();
    return { end, opponent, layout, myTaps, opponentTaps, format };
  });
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const interstitial = useInterstitial();
  const find = useFindMatch({
    arena: arena.data,
    maps: maps.data ?? [],
    onError,
    isReplacing: true,
  });
  const [zoomed, setZoomed] = useState<ZoomedMap>(null);
  const [isLeagueMomentOpen, setIsLeagueMomentOpen] = useState(match.end?.league.changed === true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCounted, setIsCounted] = useState(false);
  const result = match.end?.result;

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: arenaKeys.all });
    void queryClient.invalidateQueries({ queryKey: matchKeys.all });
    void queryClient.invalidateQueries({ queryKey: walletKeys.all });
  }, [queryClient]);

  const isLeagueUp =
    match.end?.league.changed === true && match.end.trophies.after > match.end.trophies.before;

  useEffect(() => {
    if (result === "win" || isLeagueUp) haptic("success");
    else if (result === "loss") haptic("warning");
  }, [result, isLeagueUp]);

  // A finished match counts towards the interstitial like a finished level (Part 1 §6.5) (завершённый матч считается для межстраничной рекламы как пройденный уровень).
  const leaveWith = async (next: () => void) => {
    if (isLeaving) return;
    setIsLeaving(true);
    if (!isCounted) {
      setIsCounted(true);
      interstitial.finishLevel();
      await interstitial.showIfDue();
    }
    matchSession.leave();
    next();
    setIsLeaving(false);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      void leaveWith(() => router.back());
      return true;
    });
    return () => subscription.remove();
  });

  return {
    ...match,
    myMap: maps.data?.find(({ id }) => id === arena.data?.activeMapId) ?? null,
    find,
    zoomed,
    isLeagueMomentOpen,
    handleZoom: setZoomed,
    isLeagueUp,
    handleLeagueMomentClose: () => setIsLeagueMomentOpen(false),
    handleArena: () => void leaveWith(() => router.back()),
    handleAgain: () => void leaveWith(find.handleFight),
  };
};
