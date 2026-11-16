import { router } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";

import { useArenaQuery } from "@entities/arena";
import { arenaMapOf, useArenaMapsQuery } from "@entities/arena-map";
import { banOf, banOfDetails, useServerMinute, useSystemState } from "@entities/app-config";
import { useMatchEvents, useMatchStore } from "@entities/match";
import { useMeQuery } from "@entities/wallet";
import { useActivateArenaMap } from "@features/activate-arena-map";
import { useArenaUnlock } from "@features/arena-access";
import { useClaimSeasonStep } from "@features/claim-season-step";
import { useIsOnline } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { useFindMatch } from "@widgets/find-match";

export const useArenaHome = (onError: (messageKey: ErrorMessageKey) => void) => {
  useMatchEvents();
  const unlock = useArenaUnlock();
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const { data: me } = useMeQuery();
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const { claim, pendingStep } = useClaimSeasonStep(onError);
  const { activate, isPending: isActivating } = useActivateArenaMap({
    onActivated: () => setIsSwitchOpen(false),
    onError,
  });
  const { state: systemState } = useSystemState();
  const find = useFindMatch({ onError, isReplacing: false });
  const home = arena.data;
  const isUnlocked = home?.unlocked ?? unlock.isUnlocked;
  const meBan = me?.flags.bans?.find(({ scope }) => scope === "arena");
  const errorBan = banOf(arena.error);
  const ban =
    meBan === undefined ? (errorBan?.scope === "arena" ? errorBan : null) : banOfDetails(meBan);
  const isOpen = home !== undefined && home.unlocked && ban === null;
  const isOnboardingDue = isOpen && !home.rulesSeen;
  const runningId = isOpen ? (home.match?.id ?? null) : null;
  const queue = isOpen ? (home.queue ?? null) : null;

  useEffect(() => {
    if (isOnboardingDue) router.push("/arena/onboarding");
  }, [isOnboardingDue]);

  // An unfinished match or a running search reopens at once (незаконченный матч или идущий поиск открываются сразу).
  useEffect(() => {
    if (runningId !== null)
      router.push({ pathname: "/arena/match/[id]", params: { id: runningId } });
  }, [runningId]);

  const openSearch = useEffectEvent(() => {
    if (queue === null) return;
    useMatchStore.getState().receiveQueue(queue);
    router.push("/arena/search");
  });
  const joinedAt = queue?.joinedAt ?? null;

  // Only a new search reopens the screen (экран открывает только новый поиск).
  useEffect(() => {
    if (joinedAt !== null) openSearch();
  }, [joinedAt]);

  return {
    isUnlocked,
    ban,
    seasonResult: isOpen && home.rulesSeen ? (home.season?.result ?? null) : null,
    passed: unlock.passed,
    unlockLevel: home?.unlockLevel ?? unlock.unlockLevel,
    arena: home,
    isPending: arena.isPending,
    error: arena.error,
    updatedAt: arena.dataUpdatedAt,
    isOnline,
    now,
    activeMap: home?.activeMap === undefined ? null : arenaMapOf(home.activeMap),
    maps: maps.data?.maps ?? [],
    maxMaps: maps.data?.max ?? home?.maxMaps ?? 0,
    pendingStep,
    isSwitchOpen,
    isActivating,
    isEarnOpen,
    canFight: isOnline && systemState.kind !== "maintenance" && !find.isPending,
    find,
    handleRetry: () => void arena.refetch(),
    handleClaim: claim,
    handleSwitchOpen: () => setIsSwitchOpen(true),
    handleSwitchClose: () => setIsSwitchOpen(false),
    handleActivate: activate,
    handleEditMap: (mapId: string) => {
      setIsSwitchOpen(false);
      router.push({ pathname: "/arena/map/[id]", params: { id: mapId } });
    },
    handleWalletPress: () => setIsEarnOpen(true),
    handleEarnClose: () => setIsEarnOpen(false),
  };
};
