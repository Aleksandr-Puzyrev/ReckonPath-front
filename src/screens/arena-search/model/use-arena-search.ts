import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";

import { useArenaQuery } from "@entities/arena";
import { arenaMapOf } from "@entities/arena-map";
import {
  leaveQueueMutationOptions,
  matchSession,
  useMatchEvents,
  useMatchStore,
  useServerNow,
} from "@entities/match";
import { errorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";
import { useFindMatch } from "@widgets/find-match";

export const useArenaSearch = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  useMatchEvents();
  const arena = useArenaQuery();
  const queue = useMatchStore((state) => state.queue);
  const matchId = useMatchStore((state) =>
    state.view !== null && state.view.status !== "done" ? state.view.id : null,
  );
  const now = useServerNow();
  const find = useFindMatch({ onError: (messageKey) => onToast(t(messageKey)), isReplacing: true });
  const isBotDue = queue !== null && now >= Date.parse(queue.botAt);

  const leave = useMutation({
    ...leaveQueueMutationOptions(),
    onSuccess: () => {
      useMatchStore.getState().receiveQueue(null);
      router.back();
    },
    onError: (error) => onToast(t(errorMessageKey(error))),
  });

  // The rival is found by a push; the screen then moves on to the match (соперник находится пушем; экран переходит к матчу).
  useEffect(() => {
    if (matchId === null) return;
    haptic("success");
    router.replace({ pathname: "/arena/match/[id]", params: { id: matchId } });
  }, [matchId]);

  const askForMatch = useEffectEvent(() => void matchSession.refresh());

  // The bot comes by itself at botAt; a lost push is caught by reading the current match (бот приходит сам в botAt; потерянный пуш ловится чтением текущего матча).
  useEffect(() => {
    if (isBotDue) askForMatch();
  }, [isBotDue]);

  return {
    queue,
    activeMap: arena.data?.activeMap === undefined ? null : arenaMapOf(arena.data.activeMap),
    waitedMs: queue === null ? 0 : Math.max(0, now - Date.parse(queue.joinedAt)),
    canPlayMap: queue !== null && now >= Date.parse(queue.mapOfferAt),
    isLeaving: leave.isPending,
    handleCancel: () => {
      if (!leave.isPending) leave.mutate();
    },
    handleVsMap: find.handleMapMatch,
  };
};
