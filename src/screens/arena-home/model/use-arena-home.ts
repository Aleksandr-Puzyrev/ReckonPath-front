import { router } from "expo-router";
import { useState } from "react";

import { useArenaQuery } from "@entities/arena";
import { useArenaMapsQuery } from "@entities/arena-map";
import { useServerMinute } from "@entities/app-config";
import { useMatchHistoryQuery } from "@entities/match";
import { useProgressStore } from "@entities/progress";
import { useActivateArenaMap } from "@features/activate-arena-map";
import { useClaimSeasonStep } from "@features/claim-season-step";
import { useIsOnline } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { isArenaUnlocked, passedTowardsArena } from "./arena-unlock";

const HISTORY_ROWS = 5;

export const useArenaHome = (onError: (messageKey: ErrorMessageKey) => void) => {
  const best = useProgressStore((state) => state.best);
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const history = useMatchHistoryQuery();
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const { claim, pendingStep } = useClaimSeasonStep(onError);
  const { activate, isPending: isActivating } = useActivateArenaMap({
    onActivated: () => setIsSwitchOpen(false),
    onError,
  });
  const format = arena.data?.format;
  const formatMaps = (maps.data ?? []).filter(({ format: size }) => size === format?.size);

  return {
    isUnlocked: isArenaUnlocked(best),
    passed: passedTowardsArena(best),
    arena: arena.data,
    isPending: arena.isPending,
    error: arena.error,
    updatedAt: arena.dataUpdatedAt,
    isOnline,
    now,
    activeMap: formatMaps.find(({ id }) => id === arena.data?.activeMapId) ?? null,
    formatMaps,
    matches: history.data?.pages[0]?.items.slice(0, HISTORY_ROWS) ?? [],
    pendingStep,
    isSwitchOpen,
    isActivating,
    isEarnOpen,
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
