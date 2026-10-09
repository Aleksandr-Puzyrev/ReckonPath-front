import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

export type Wallet = components["schemas"]["Wallet"];

const ME_STALE_MS = 60_000;

export const walletKeys = {
  all: ["me"] as const,
};

export const meQueryOptions = () =>
  queryOptions({
    queryKey: walletKeys.all,
    queryFn: async () => readData(await apiClient.GET("/me")),
    staleTime: ME_STALE_MS,
  });

export const useMeQuery = () => useQuery(meQueryOptions());

export const useWalletQuery = () =>
  useQuery({ ...meQueryOptions(), select: ({ wallet }) => wallet });

// Every answer that changes a balance carries the new wallet, which replaces the cached one (каждый ответ, меняющий баланс, несёт новый кошелёк, и он заменяет сохранённый).
export const applyWallet = (queryClient: QueryClient, wallet: Wallet) =>
  queryClient.setQueryData(meQueryOptions().queryKey, (me) =>
    me === undefined ? me : { ...me, wallet },
  );
