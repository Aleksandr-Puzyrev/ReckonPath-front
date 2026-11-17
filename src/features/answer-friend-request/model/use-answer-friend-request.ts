import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateFriendsLeaderboard } from "@entities/daily";
import { invalidateFriends } from "@entities/friend";
import type { FriendRequest } from "@entities/friend";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { answerFriendRequestMutationOptions } from "../api/answer-friend-request-mutations";
import type { FriendRequestAnswer } from "../api/answer-friend-request-mutations";

interface AnswerCallbacks {
  onAccepted: (name: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The answers return no data, so the list is re-read after each of them (ответы не несут данных, поэтому после каждого список перечитывается).
export const useAnswerFriendRequest = ({ onAccepted, onError }: AnswerCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...answerFriendRequestMutationOptions(),
    onSettled: () => invalidateFriends(queryClient),
    onError: (error) => onError(errorMessageKey(error)),
  });

  const answer = (request: FriendRequest, kind: FriendRequestAnswer) =>
    mutate(
      { answer: kind, id: request.id },
      {
        onSuccess: () => {
          if (kind !== "accept") return;
          void invalidateFriendsLeaderboard(queryClient);
          onAccepted(request.user.name);
        },
      },
    );

  return {
    isPending,
    accept: (request: FriendRequest) => answer(request, "accept"),
    decline: (request: FriendRequest) => answer(request, "decline"),
    withdraw: (request: FriendRequest) => answer(request, "withdraw"),
  };
};
