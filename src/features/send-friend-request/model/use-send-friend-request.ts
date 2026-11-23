import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateFriendsLeaderboard } from "@entities/daily";
import { invalidateFriends } from "@entities/friend";
import { invalidatePlayers } from "@entities/player";
import type { PlayerRef } from "@entities/player";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { sendFriendRequestMutationOptions } from "../api/send-friend-request-mutation";

interface SendCallbacks {
  onBefriended: (name: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// A request to a player who has already asked me is the backend's way to accept (заявка игроку, который уже звал меня, — способ бэкенда принять его заявку).
export const useSendFriendRequest = ({ onBefriended, onError }: SendCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, variables } = useMutation({
    ...sendFriendRequestMutationOptions(),
    onSettled: () => Promise.all([invalidateFriends(queryClient), invalidatePlayers(queryClient)]),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    pendingUserId: isPending ? variables : null,
    send: (player: PlayerRef) =>
      mutate(player.id, {
        onSuccess: ({ status }) => {
          if (status !== "accepted") return;
          void invalidateFriendsLeaderboard(queryClient);
          onBefriended(player.name);
        },
      }),
  };
};
