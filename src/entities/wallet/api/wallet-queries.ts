import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import type { components } from "@shared/api";

export type Wallet = components["schemas"]["Wallet"];

const ME_STALE_MS = 60_000;
const WALLET_STALE_MS = 60_000;

// The wallet lives under the player's prefix, so refreshing the player refreshes it too (кошелёк живёт под префиксом игрока, поэтому обновление игрока обновляет и его).
export const walletKeys = {
  all: ["me"] as const,
  wallet: () => [...walletKeys.all, "wallet"] as const,
};

export const meQueryOptions = () =>
  queryOptions({
    queryKey: walletKeys.all,
    queryFn: async () => readData(await apiClient.GET("/me")),
    staleTime: ME_STALE_MS,
  });

export const walletQueryOptions = () =>
  queryOptions({
    queryKey: walletKeys.wallet(),
    queryFn: async (): Promise<Wallet> => {
      const { gems, coins } = readData(await apiClient.GET("/wallet"));
      return { emeralds: gems, coins };
    },
    staleTime: WALLET_STALE_MS,
  });

export const useMeQuery = () => useQuery({ ...meQueryOptions(), enabled: useHasAccount() });

export const useWalletQuery = () => useQuery({ ...walletQueryOptions(), enabled: useHasAccount() });

// Every answer that changes a balance carries the new wallet, which replaces the cached one (каждый ответ, меняющий баланс, несёт новый кошелёк, и он заменяет сохранённый).
export const applyWallet = (queryClient: QueryClient, wallet: Wallet) =>
  queryClient.setQueryData(walletQueryOptions().queryKey, (current) =>
    current === undefined ? current : wallet,
  );
