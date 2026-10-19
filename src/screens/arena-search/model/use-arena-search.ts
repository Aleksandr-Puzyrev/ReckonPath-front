import { router } from "expo-router";
import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { useShallow } from "zustand/react/shallow";

import { useArenaQuery } from "@entities/arena";
import { useArenaMapsQuery } from "@entities/arena-map";
import { matchSession, useMatchStore } from "@entities/match";
import type { MatchPhase, SearchError } from "@entities/match";
import { haptic } from "@shared/haptics";

const SEARCH_ERROR_TEXTS = {
  MAP_INVALID: "errors.MAP_INVALID",
  BANNED: "system.banned.title",
  NETWORK: "errors.NETWORK",
} as const;

const TURN_PHASES: ReadonlySet<MatchPhase> = new Set(["myTurn", "opponentTurn", "finalTurn"]);

export const useArenaSearch = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const match = useMatchStore(
    useShallow(
      ({
        phase,
        waitedSec,
        isAsyncAvailable,
        matchId,
        opponent,
        firstPlayer,
        searchError,
        inMatch,
        event,
      }) => ({
        phase,
        waitedSec,
        isAsyncAvailable,
        matchId,
        opponent,
        firstPlayer,
        searchError,
        inMatch,
        event,
      }),
    ),
  );
  const activeMap = maps.data?.find(({ id }) => id === arena.data?.activeMapId) ?? null;
  const isPlaying = TURN_PHASES.has(match.phase);
  const { matchId } = match;

  const openMatch = () => {
    if (matchId !== null)
      router.replace({ pathname: "/arena/match/[id]", params: { id: matchId } });
  };

  useEffect(() => {
    if (match.event?.kind === "found") haptic("success");
  }, [match.event]);

  useEffect(() => {
    if (!isPlaying || matchId === null) return undefined;
    const timer = setTimeout(
      () => router.replace({ pathname: "/arena/match/[id]", params: { id: matchId } }),
      theme.motion.animation.versusHold,
    );
    return () => clearTimeout(timer);
  }, [isPlaying, matchId, theme.motion.animation.versusHold]);

  const failSearch = useEffectEvent((searchError: SearchError | null) => {
    onToast(t(SEARCH_ERROR_TEXTS[searchError ?? "NETWORK"]));
    matchSession.leave();
    const mapId = arena.data?.activeMapId;
    if (searchError === "MAP_INVALID" && mapId != null) {
      router.replace({ pathname: "/arena/map/[id]", params: { id: mapId } });
    } else {
      router.back();
    }
  });

  useEffect(() => {
    if (match.searchError !== null || match.phase === "lost") failSearch(match.searchError);
  }, [match.searchError, match.phase]);

  const leave = () => {
    matchSession.leave();
    router.back();
  };

  return {
    ...match,
    arena: arena.data,
    activeMap,
    handleCancel: () => {
      matchSession.cancelSearch();
      leave();
    },
    handleLeave: leave,
    handleSearchAgain: () => {
      if (arena.data?.activeMapId != null) {
        matchSession.search(arena.data.format.size, arena.data.activeMapId);
      }
    },
    handleRejoin: () => {
      if (match.inMatch === null) return;
      const { matchId: runningId, endpoint } = match.inMatch;
      matchSession.returnTo(endpoint);
      router.replace({ pathname: "/arena/match/[id]", params: { id: runningId } });
    },
    handleToMatch: openMatch,
  };
};
