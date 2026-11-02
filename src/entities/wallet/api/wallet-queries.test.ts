import { QueryClient } from "@tanstack/react-query";

import { mockServer } from "@shared/test-utils/api-mock";

import { applyWallet, walletQueryOptions } from "./wallet-queries";

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });

describe("walletQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("reads the backend gems as emeralds (decision 0055 #1)", async () => {
    const wallet = await createClient().fetchQuery(walletQueryOptions());

    expect(wallet).toEqual({ emeralds: 2640, coins: 18420 });
  });
});

describe("applyWallet", () => {
  test("replaces the cached balance with the one from an answer (LVL-26)", () => {
    const queryClient = createClient();
    queryClient.setQueryData(walletQueryOptions().queryKey, { emeralds: 2640, coins: 18420 });

    applyWallet(queryClient, { emeralds: 2625, coins: 18470 });

    expect(queryClient.getQueryData(walletQueryOptions().queryKey)).toEqual({
      emeralds: 2625,
      coins: 18470,
    });
  });

  test("does nothing before the balance has arrived", () => {
    const queryClient = createClient();

    applyWallet(queryClient, { emeralds: 1, coins: 1 });

    expect(queryClient.getQueryData(walletQueryOptions().queryKey)).toBeUndefined();
  });
});
