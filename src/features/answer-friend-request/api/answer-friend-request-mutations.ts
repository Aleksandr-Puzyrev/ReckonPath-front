import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readEmpty } from "@shared/api";

export type FriendRequestAnswer = "accept" | "decline" | "withdraw";

const sendAnswer = async (answer: FriendRequestAnswer, id: string) => {
  const params = { params: { path: { id } } };
  if (answer === "accept") {
    return readEmpty(await apiClient.POST("/friends/requests/{id}/accept", params));
  }
  if (answer === "decline") {
    return readEmpty(await apiClient.POST("/friends/requests/{id}/decline", params));
  }
  return readEmpty(await apiClient.DELETE("/friends/requests/{id}", params));
};

export const answerFriendRequestMutationOptions = () =>
  mutationOptions({
    mutationKey: ["friends", "answer"],
    mutationFn: ({ answer, id }: { answer: FriendRequestAnswer; id: string }) =>
      sendAnswer(answer, id),
  });
