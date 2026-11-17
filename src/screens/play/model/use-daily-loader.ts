import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { uuidv7 } from "uuidv7";

import {
  dailyGameKey,
  dailyKeys,
  invalidateDailyProgress,
  playDailyMutationOptions,
  useDailyGameQuery,
} from "@entities/daily";
import type { DailyGame } from "@entities/daily";
import { gameInError } from "@entities/level";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export type DailyLoad =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "offline" }
  | { kind: "failed"; messageKey: ErrorMessageKey }
  | { kind: "ready"; game: DailyGame };

const failureOf = (error: unknown): DailyLoad => {
  if (!isApiError(error)) return { kind: "offline" };
  if (error.code === "daily_unavailable") return { kind: "unavailable" };
  return { kind: "failed", messageKey: errorMessageKey(error) };
};

// Opening the daily asks the server for the running game or a new attempt; a day already won answers daily_done with the won game (открытие дейли просит у сервера идущую партию или новую попытку; уже выигранный день отвечает daily_done с выигранной партией).
export const useDailyLoader = () => {
  const queryClient = useQueryClient();
  const play = useMutation({
    ...playDailyMutationOptions(),
    networkMode: "always",
    onSuccess: (started) => {
      queryClient.setQueryData(dailyGameKey(started.id), started);
      void queryClient.invalidateQueries({ queryKey: dailyKeys.overview() });
    },
    onError: (error) => {
      const won = gameInError<DailyGame>(error, "daily_done");
      if (won === null) return;
      queryClient.setQueryData(dailyGameKey(won.id), won);
      void invalidateDailyProgress(queryClient);
    },
  });
  const won = gameInError<DailyGame>(play.error, "daily_done");
  const game = useDailyGameQuery(play.data?.id ?? won?.id ?? null);

  // A retry repeats the start that failed: a failed restart must not resume the old attempt (повтор повторяет упавший старт: упавший перезапуск не должен продолжить старую попытку).
  const isRestartRef = useRef(false);

  const start = (isRestart: boolean) => {
    isRestartRef.current = isRestart;
    play.mutate({ isRestart, idempotencyKey: uuidv7() });
  };

  useEffect(() => {
    if (play.isIdle) start(isRestartRef.current);
  });

  const load = (): DailyLoad => {
    if (play.error !== null && won === null) return failureOf(play.error);
    if (game.data === undefined) return { kind: "loading" };
    return { kind: "ready", game: game.data };
  };

  return {
    load: load(),
    restart: () => start(true),
    retry: () => play.reset(),
  };
};
