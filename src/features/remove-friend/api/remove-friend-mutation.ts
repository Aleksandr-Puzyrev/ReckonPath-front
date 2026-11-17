import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readEmpty } from "@shared/api";

export const removeFriendMutationOptions = () =>
  mutationOptions({
    mutationKey: ["friends", "remove"],
    mutationFn: async (userId: string) =>
      readEmpty(await apiClient.DELETE("/friends/{id}", { params: { path: { id: userId } } })),
  });
