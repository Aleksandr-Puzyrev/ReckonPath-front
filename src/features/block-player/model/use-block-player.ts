import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { invalidateChallenges } from "@entities/challenge";
import { invalidateFriendsLeaderboard } from "@entities/daily";
import { invalidateFriends } from "@entities/friend";
import { invalidatePlayers } from "@entities/player";
import type { PlayerRef } from "@entities/player";
import { errorMessageKey } from "@shared/api";

import {
  blockPlayerMutationOptions,
  unblockPlayerMutationOptions,
} from "../api/block-player-mutations";

// A block ends the friendship, the requests and the challenges, and an unblock returns the player to search, so all of them are re-read (блокировка завершает дружбу, заявки и вызовы, а разблокировка возвращает игрока в поиск, поэтому всё это перечитывается).
export const useBlockPlayer = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<PlayerRef | null>(null);
  const refresh = () =>
    Promise.all([
      invalidatePlayers(queryClient),
      invalidateFriends(queryClient),
      invalidateFriendsLeaderboard(queryClient),
      invalidateChallenges(queryClient),
    ]);
  const showError = (error: unknown) => onToast(t(errorMessageKey(error)));
  const block = useMutation({
    ...blockPlayerMutationOptions(),
    onSettled: refresh,
    onError: showError,
  });
  const unblock = useMutation({
    ...unblockPlayerMutationOptions(),
    onSettled: refresh,
    onError: showError,
  });

  return {
    confirming,
    isPending: block.isPending || unblock.isPending,
    ask: setConfirming,
    cancel: () => setConfirming(null),
    confirm: () => {
      if (confirming === null) return;
      const player = confirming;
      setConfirming(null);
      block.mutate(player.id, {
        onSuccess: () => onToast(t("block.blocked", { name: player.name })),
      });
    },
    unblock: (player: PlayerRef) =>
      unblock.mutate(player.id, {
        onSuccess: () => onToast(t("block.unblocked", { name: player.name })),
      }),
  };
};
