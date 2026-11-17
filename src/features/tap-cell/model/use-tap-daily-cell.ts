import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import type { GameEvent, Idx } from "@reckon-path/engine";

import {
  dailyGameKey,
  dailyGameQueryOptions,
  dailyLevelId,
  invalidateDailyProgress,
  tapDailyGameMutationOptions,
} from "@entities/daily";
import type { DailyGame } from "@entities/daily";
import {
  cellIdxOf,
  freshGameOf,
  playViewOfServerGame,
  serverTapEvents,
  useCampaignFlagsStore,
} from "@entities/level";
import { streakKeys } from "@entities/streak";
import { applyWallet, walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";

import { hapticsForEvents } from "./haptics-for-events";

interface TapCallbacks {
  onTapped: (cell: Idx, events: GameEvent[], game: DailyGame) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

type TapRequest = Parameters<
  NonNullable<ReturnType<typeof tapDailyGameMutationOptions>["mutationFn"]>
>[0];

// The game ended elsewhere (another device, the day is over) or the cell is open: the server's game decides (партия закончилась в другом месте — другое устройство, конец дня — или клетка открыта: решает партия сервера).
const REFETCH_CODES = new Set(["game_over", "cell_open"]);

export const useTapDailyCell = ({ onTapped, onError }: TapCallbacks) => {
  const queryClient = useQueryClient();
  const [failedTap, setFailedTap] = useState<TapRequest | null>(null);

  const replaceGame = (game: DailyGame) => queryClient.setQueryData(dailyGameKey(game.id), game);

  // A finished game changes the day, the top and, after a win, the streak and the balance (законченная партия меняет день, топ, а после победы — серию и баланс).
  const settleFinished = (game: DailyGame) => {
    if (game.status === "play") return;
    void invalidateDailyProgress(queryClient);
    if (game.status !== "won") return;
    void queryClient.invalidateQueries({ queryKey: streakKeys.all });
    const wallet = game.result?.wallet;
    if (wallet === undefined) void queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
    else applyWallet(queryClient, { emeralds: wallet.gems, coins: wallet.coins });
  };

  const refetchGame = async (id: string) => {
    try {
      settleFinished(await queryClient.fetchQuery({ ...dailyGameQueryOptions(id), staleTime: 0 }));
    } catch (error) {
      onError(errorMessageKey(error));
    }
  };

  const { mutate, isPending } = useMutation({
    ...tapDailyGameMutationOptions(),
    networkMode: "always",
    onMutate: () => setFailedTap(null),
    onSuccess: ({ game }, request) => {
      replaceGame(game);
      const view = playViewOfServerGame(game, dailyLevelId(game.date));
      const cell = cellIdxOf(view.board.cols, request);
      const events = serverTapEvents(cell, game, view);
      haptic(...hapticsForEvents(events));
      useCampaignFlagsStore.getState().remove(game.id, cell);
      settleFinished(game);
      onTapped(cell, events, game);
    },
    onError: (error, request) => {
      const fresh = freshGameOf<DailyGame>(error);
      if (fresh !== null) {
        replaceGame(fresh);
        settleFinished(fresh);
        return;
      }
      if (!isApiError(error)) {
        setFailedTap(request);
        return;
      }
      if (error.code !== null && REFETCH_CODES.has(error.code)) {
        void refetchGame(request.id);
        return;
      }
      if (error.code !== "invalid_cell") onError(errorMessageKey(error));
    },
  });

  const tap = (game: DailyGame, cell: Idx) => {
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
