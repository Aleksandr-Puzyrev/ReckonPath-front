import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

export const supportTicketKeys = { all: ["supportTickets"] as const };

export const supportHistoryOptions = () =>
  queryOptions({
    queryKey: supportTicketKeys.all,
    queryFn: async ({ signal }) =>
      readData(await apiClient.GET("/support/tickets", { signal })).tickets,
    staleTime: 30_000,
  });

export const useSupportHistory = () => {
  const hasAccount = useHasAccount();
  return useQuery({ ...supportHistoryOptions(), enabled: HAS_BACKEND && hasAccount });
};
