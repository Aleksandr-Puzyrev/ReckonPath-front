import { QueryClient } from "@tanstack/react-query";

import type { components } from "@shared/api";

import { applyWallet, meQueryOptions } from "./wallet-queries";

const ME: components["schemas"]["Me"] = {
  id: "me",
  nickname: "Me",
  isGuest: true,
  providers: [],
  level: 1,
  xp: 0,
  xpToNext: 50,
  wallet: { emeralds: 2640, coins: 18420 },
  arena: { trophies: 0, league: "BRONZE", division: 3, peak: 0, rp: 0, seasonId: 1 },
  loadout: {},
  flags: {},
  friendCode: "ME",
};

describe("applyWallet", () => {
  test("replaces the cached balance with the one from an answer (LVL-26)", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
    });
    queryClient.setQueryData(meQueryOptions().queryKey, ME);

    applyWallet(queryClient, { emeralds: 2625, coins: 18470 });

    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.wallet).toEqual({
      emeralds: 2625,
      coins: 18470,
    });
  });

  test("does nothing before the player's data has arrived", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
    });

    applyWallet(queryClient, { emeralds: 1, coins: 1 });

    expect(queryClient.getQueryData(meQueryOptions().queryKey)).toBeUndefined();
  });
});
