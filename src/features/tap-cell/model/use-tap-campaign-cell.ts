import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import type { GameEvent, Idx } from "@reckon-path/engine";

import {
  campaignGameKey,
  campaignTapEvents,
  cellIdxOf,
  freshGameOf,
  invalidateCampaignProgress,
  playViewOfCampaignGame,
  tapCampaignGameMutationOptions,
  useCampaignFlagsStore,
} from "@entities/level";
import type { CampaignGame } from "@entities/level";
import { applyWallet } from "@entities/wallet";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";

import { hapticsForEvents } from "./haptics-for-events";

interface TapCallbacks {
  onTapped: (cell: Idx, events: GameEvent[], game: CampaignGame) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

type TapRequest = Parameters<
  NonNullable<ReturnType<typeof tapCampaignGameMutationOptions>["mutationFn"]>
>[0];

// The cell is already open or cannot be tapped: the board explains it locally (клетка уже открыта или по ней тапать нельзя — поле объясняет это само).
const SILENT_CODES = new Set(["cell_open", "invalid_cell"]);

export const useTapCampaignCell = ({ onTapped, onError }: TapCallbacks) => {
  const queryClient = useQueryClient();
  const [failedTap, setFailedTap] = useState<TapRequest | null>(null);

  const replaceGame = (game: CampaignGame) =>
    queryClient.setQueryData(campaignGameKey(game.id), game);

  const { mutate, isPending } = useMutation({
    ...tapCampaignGameMutationOptions(),
    networkMode: "always",
    onMutate: () => setFailedTap(null),
    onSuccess: ({ game }, request) => {
      replaceGame(game);
      const view = playViewOfCampaignGame(game);
      const cell = cellIdxOf(view.board.cols, request);
      const events = campaignTapEvents(cell, game, view);
      haptic(...hapticsForEvents(events));
      useCampaignFlagsStore.getState().remove(game.id, cell);
      const wallet = game.result?.wallet;
      if (wallet !== undefined)
        applyWallet(queryClient, { emeralds: wallet.gems, coins: wallet.coins });
      if (game.status !== "play") void invalidateCampaignProgress(queryClient);
      onTapped(cell, events, game);
    },
    onError: (error, request) => {
      const fresh = freshGameOf(error);
      if (fresh !== null) {
        replaceGame(fresh);
        return;
      }
      if (!isApiError(error)) {
        setFailedTap(request);
        return;
      }
      if (error.code === "game_over") {
        void queryClient.invalidateQueries({ queryKey: campaignGameKey(request.id) });
        return;
      }
      if (error.code === null || !SILENT_CODES.has(error.code)) onError(errorMessageKey(error));
    },
  });

  const tap = (game: CampaignGame, cell: Idx) => {
    const { cols } = game.board;
    mutate({
      id: game.id,
      row: Math.floor(cell / cols),
      col: cell % cols,
      seq: game.seq,
      idempotencyKey: uuidv7(),
    });
  };

  // The retry repeats the same tap with the same key, so a tap the server already made is not made twice (повтор шлёт тот же тап с тем же ключом, чтобы уже сделанный сервером тап не повторился).
  const retry = () => {
    if (failedTap !== null) mutate(failedTap);
  };

  return { tap, retry, isPending, isFailed: failedTap !== null };
};
