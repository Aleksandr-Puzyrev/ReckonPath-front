import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { mockServer, passMockLevels, setMockArena } from "@shared/test-utils/api-mock";

import { claimSeasonResultMutationOptions, claimTrackStepMutationOptions } from "./arena-mutations";
import { applySeason, arenaQueryOptions } from "./arena-queries";

const UNLOCK_LEVEL = 12;

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

describe("arenaQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("reads the league, its format and the season from GET /arena", async () => {
    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena.league.format).toEqual(
      expect.objectContaining({ rows: 6, cols: 6, targets: 1, moveSeconds: 10 }),
    );
    expect(arena.league.next).toEqual(expect.objectContaining({ division: "II", min: 200 }));
    expect(arena.season?.track.length).toBeGreaterThan(0);
  });

  test("keeps the arena locked before the unlock level", async () => {
    passMockLevels(UNLOCK_LEVEL - 1);

    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena).toEqual(expect.objectContaining({ unlocked: false, unlockLevel: UNLOCK_LEVEL }));
  });

  test("opens the arena at the unlock level", async () => {
    passMockLevels(UNLOCK_LEVEL);

    const arena = await createClient().fetchQuery(arenaQueryOptions());

    expect(arena.unlocked).toBe(true);
  });
});

describe("season claims", () => {
  afterEach(() => mockServer.reset());

  test("claims a ready track step and gets the new wallet and season", async () => {
    const client = createClient();
    await client.fetchQuery(arenaQueryOptions());

    const claim = await new MutationObserver(client, claimTrackStepMutationOptions()).mutate(1);
    applySeason(client, claim.season);

    expect(claim).toEqual(expect.objectContaining({ coins: 200, gems: 0 }));
    expect(claim.wallet).toEqual(expect.objectContaining({ coins: expect.any(Number) }));
    expect(client.getQueryData(arenaQueryOptions().queryKey)?.season?.track[0]?.state).toBe(
      "claimed",
    );
  });

  test("refuses a locked step with step_locked", async () => {
    await expect(
      new MutationObserver(createClient(), claimTrackStepMutationOptions()).mutate(2),
    ).rejects.toEqual(expect.objectContaining({ code: "step_locked" }));
  });

  test("claims the past season's result once", async () => {
    setMockArena({ hasPastSeason: true });
    const client = createClient();

    const claim = await new MutationObserver(client, claimSeasonResultMutationOptions()).mutate();

    expect(claim).toEqual(expect.objectContaining({ coins: 1500, gems: 60 }));
    expect(claim.season.result).toBeUndefined();
    await expect(
      new MutationObserver(client, claimSeasonResultMutationOptions()).mutate(),
    ).rejects.toEqual(expect.objectContaining({ code: "no_season_result" }));
  });
});
