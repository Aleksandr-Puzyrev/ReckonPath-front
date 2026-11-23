import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { invalidateFriendsLeaderboard } from "@entities/daily";
import { invalidateFriends } from "@entities/friend";
import { invalidatePlayers } from "@entities/player";
import type { PlayerRef } from "@entities/player";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { removeFriendMutationOptions } from "../api/remove-friend-mutation";

export const useRemoveFriend = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<PlayerRef | null>(null);
  const { mutate, isPending, variables } = useMutation({
    ...removeFriendMutationOptions(),
    onSettled: () =>
      Promise.all([
        invalidateFriends(queryClient),
        invalidateFriendsLeaderboard(queryClient),
        invalidatePlayers(queryClient),
      ]),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    confirming,
    removingId: isPending ? variables : null,
    ask: setConfirming,
    cancel: () => setConfirming(null),
    confirm: () => {
      if (confirming === null) return;
      setConfirming(null);
      mutate(confirming.id);
    },
  };
};
