import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

export const nicknameCheckOptions = (nickname: string) =>
  queryOptions({
    queryKey: ["nicknameCheck", nickname],
    queryFn: async ({ signal }) =>
      readData(
        await apiClient.GET("/me/nickname/check", { params: { query: { nickname } }, signal }),
      ),
    staleTime: 30_000,
    retry: false,
  });

export const useNicknameCheck = (nickname: string, enabled: boolean) => {
  const hasAccount = useHasAccount();
  return useQuery({
    ...nicknameCheckOptions(nickname),
    enabled: HAS_BACKEND && hasAccount && enabled,
  });
};
