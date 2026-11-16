import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  chooseMatchMapMutationOptions,
  matchSession,
  readyMatchMutationOptions,
  surrenderMatchMutationOptions,
  tapMatchMutationOptions,
  useMatchStore,
} from "@entities/match";
import type { MatchMapSource, MatchView } from "@entities/match";
import { errorMessageKey, isApiError } from "@shared/api";

// The server is ahead or the tap is no longer possible: the next state shows it, so nothing is said (сервер ушёл вперёд или тап уже невозможен: это покажет следующее состояние, поэтому ничего не сообщается).
const SILENT_CODES: readonly string[] = ["not_your_turn", "match_starting", "cell_open"];
const STALE_STATE = "stale_state";

const receive = (view: MatchView) => useMatchStore.getState().receive(view);

export const useMatchActions = (onToast: (text: string) => void) => {
  const { t } = useTranslation();

  const handleError = (error: Error) => {
    const code = isApiError(error) ? error.code : null;
    if (code === STALE_STATE) {
      void matchSession.refresh();
      return;
    }
    if (code !== null && SILENT_CODES.includes(code)) return;
    onToast(t(errorMessageKey(error)));
  };

  const options = { onSuccess: receive, onError: handleError };
  const tap = useMutation({ ...tapMatchMutationOptions(), ...options });
  const surrender = useMutation({ ...surrenderMatchMutationOptions(), ...options });
  const ready = useMutation({ ...readyMatchMutationOptions(), ...options });
  const chooseMap = useMutation({ ...chooseMatchMapMutationOptions(), ...options });

  return {
    isTapPending: tap.isPending,
    isPreparing: ready.isPending || chooseMap.isPending,
    tap: (view: MatchView, row: number, col: number) => {
      if (!tap.isPending) tap.mutate({ id: view.id, row, col, seq: view.seq });
    },
    surrender: (id: string) => surrender.mutate(id),
    ready: (id: string) => ready.mutate(id),
    chooseMap: (id: string, source: MatchMapSource) => chooseMap.mutate({ id, source }),
  };
};
