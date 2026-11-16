import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useEffectEvent } from "react";

import {
  joinQueueMutationOptions,
  matchSession,
  startMapMatchMutationOptions,
  useMatchStore,
} from "@entities/match";
import type { MatchView } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface FindMatchOptions {
  onError: (messageKey: ErrorMessageKey) => void;
  isReplacing: boolean;
}

export const useFindMatch = ({ onError, isReplacing }: FindMatchOptions) => {
  const go = (route: Parameters<typeof router.push>[0]) => {
    if (isReplacing) router.replace(route);
    else router.push(route);
  };
  const openMatch = (id: string) => go({ pathname: "/arena/match/[id]", params: { id } });

  // A running match comes first: the server answers the search with it, and the screen opens it at once (идущий матч важнее: сервер отвечает им на поиск, и экран сразу его открывает).
  const join = useMutation({
    ...joinQueueMutationOptions(),
    onSuccess: ({ queue, match }) => {
      if (match !== undefined) {
        void matchSession.refresh();
        openMatch(match.id);
        return;
      }
      useMatchStore.getState().receiveQueue(queue ?? null);
      go("/arena/search");
    },
    onError: (error) => {
      const runningId = isApiError(error) ? error.details.id : undefined;
      if (
        isApiError(error) &&
        error.code === "match_in_progress" &&
        typeof runningId === "string"
      ) {
        void matchSession.refresh();
        openMatch(runningId);
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  const mapMatch = useMutation({
    ...startMapMatchMutationOptions(),
    onSuccess: (match: MatchView) => {
      useMatchStore.getState().receive(match);
      openMatch(match.id);
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  const begin = () => {
    if (!join.isPending) join.mutate();
  };

  const continueAfterOffer = useEffectEvent(begin);

  // «Позже» on the link sheet goes on to the search (ARN-02) («Позже» в листе привязки продолжает поиск).
  useEffect(
    () =>
      useAccountStore.subscribe((account, previous) => {
        if (account.declined !== previous.declined && account.declined?.offer === "arena") {
          continueAfterOffer();
        }
      }),
    [],
  );

  return {
    isPending: join.isPending || mapMatch.isPending,
    handleFight: () => {
      if (useAccountStore.getState().requestArenaOffer()) return;
      begin();
    },
    handleMapMatch: () => {
      if (!mapMatch.isPending) mapMatch.mutate();
    },
  };
};
