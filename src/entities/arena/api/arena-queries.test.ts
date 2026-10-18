import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { arenaQueryOptions } from "./arena-queries";

const UNLOCK_LEVEL = 12;

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

const passLevels = (count: number) =>
  apiClient.POST("/attempts:batch", {
    body: {
      attempts: Array.from({ length: count }, (_, index) => ({
        attemptId: `attempt-${index}`,
        mode: "campaign" as const,
        ref: `c-${index + 1}`,
        taps: [],
        claimed: { result: "won" as const, movesUsed: 3, stars: 3 },
      })),
    },
  });

describe("arenaQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("gives a new player Bronze III with no trophies and the Bronze format (decision 0029 #7)", async () => {
    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena.profile).toEqual(
      expect.objectContaining({ trophies: 0, league: "BRONZE", division: 3 }),
    );
    expect(arena.format).toEqual(expect.objectContaining({ size: 5, targets: 1, turnSec: 5 }));
    expect(arena.activeMapId).toBeNull();
  });

  test("keeps the arena locked before level 12", async () => {
    await passLevels(UNLOCK_LEVEL - 1);

    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena.unlocked).toBe(false);
  });

  test("opens the arena after level 12", async () => {
    await passLevels(UNLOCK_LEVEL);

    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena.unlocked).toBe(true);
  });
});
