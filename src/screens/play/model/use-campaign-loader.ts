import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { uuidv7 } from "uuidv7";

import {
  campaignGameKey,
  playCampaignLevelMutationOptions,
  useCampaignGameQuery,
  useCampaignLevelQuery,
  useCampaignQuery,
} from "@entities/level";
import type { CampaignGame, CampaignLevelDetail, CampaignOverview } from "@entities/level";
import { TUTORIAL_KEYS } from "@entities/rules";
import { useSeenGuides } from "@features/mark-guides-seen";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export type CampaignLoad =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "locked"; lockedBy: number }
  | { kind: "offline" }
  | { kind: "failed"; messageKey: ErrorMessageKey }
  | { kind: "ready"; overview: CampaignOverview; detail: CampaignLevelDetail; game: CampaignGame };

const failureOf = (error: unknown, overview: CampaignOverview | undefined): CampaignLoad => {
  if (!isApiError(error)) return { kind: "offline" };
  if (error.code === "level_not_found") return { kind: "missing" };
  if (error.code === "level_locked")
    return { kind: "locked", lockedBy: overview?.currentLevel ?? 1 };
  return { kind: "failed", messageKey: errorMessageKey(error) };
};

// Opening a level asks the server for its unfinished game or a new one; the level 1 tutorial always starts over (открытие уровня просит у сервера незаконченную партию или новую; обучение уровня 1 всегда начинается заново).
export const useCampaignLoader = (number: number) => {
  const queryClient = useQueryClient();
  const overview = useCampaignQuery();
  const detail = useCampaignLevelQuery(number);
  const seen = useSeenGuides();
  const play = useMutation({
    ...playCampaignLevelMutationOptions(),
    networkMode: "always",
    onSuccess: (started) => queryClient.setQueryData(campaignGameKey(started.id), started),
  });
  const gameId = play.data?.id ?? null;
  const game = useCampaignGameQuery(gameId);
  const isFreshTutorial =
    detail.data?.tutorial === TUTORIAL_KEYS.firstLevel &&
    !seen.isTutorialSeen(TUTORIAL_KEYS.firstLevel);
  const isReadyToPlay = overview.data !== undefined && detail.data !== undefined;

  const start = (isRestart: boolean) =>
    play.mutate({ number, isRestart, idempotencyKey: uuidv7() });

  useEffect(() => {
    if (isReadyToPlay && play.isIdle) {
      start(isFreshTutorial);
    }
  });

  const load = (): CampaignLoad => {
    const error =
      (detail.data === undefined ? detail.error : null) ??
      play.error ??
      (overview.data === undefined ? overview.error : null);
    if (error !== null) return failureOf(error, overview.data);
    if (overview.data === undefined || detail.data === undefined || game.data === undefined) {
      return { kind: "loading" };
    }
    return { kind: "ready", overview: overview.data, detail: detail.data, game: game.data };
  };

  return {
    load: load(),
    restart: () => start(true),
    retry: () => {
      if (detail.isError) void detail.refetch();
      if (overview.isError) void overview.refetch();
      play.reset();
    },
  };
};
