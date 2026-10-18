import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { recordMockMatch } from "@shared/api/mocks/mock-arena-profile";
import { mockServer } from "@shared/test-utils/api-mock";

import { claimSeasonStepMutationOptions } from "./claim-season-step-mutation";

const WINS_FOR_ONE_STEP = 5;

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

const claim = (step: number) =>
  new MutationObserver(queryClient, claimSeasonStepMutationOptions()).mutate(step);

const winMatches = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    recordMockMatch({
      outcome: "win",
      kind: "ranked",
      opponentTrophies: 0,
      details: {
        matchId: `m${index}`,
        mode: "ranked",
        opponent: { id: "u2", nickname: "Kira", league: "BRONZE", isBot: false, label: null },
        result: "win",
        reason: "targets",
        turns: { me: 5, opponent: 5 },
        endedAt: "2026-10-18T12:00:00Z",
        maps: {
          mine: { rows: 5, cols: 5, targets: [[0, 0]] },
          opponent: { rows: 5, cols: 5, targets: [[4, 4]] },
        },
        taps: [],
      },
    }),
  );

const track = async () => (await apiClient.GET("/arena")).data?.season.track ?? [];

describe("claimSeasonStepMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("lists 30 steps of 50 RP, locked without RP (decision 0031 #2)", async () => {
    const steps = await track();

    expect(steps).toHaveLength(30);
    expect(steps[0]).toEqual({
      step: 1,
      rp: 50,
      reward: { currency: "coin", amount: 200 },
      state: "locked",
    });
    await expect(claim(1)).rejects.toEqual(expect.objectContaining({ code: "VALIDATION" }));
  });

  test("gives the reward of an available step with the new wallet", async () => {
    winMatches(WINS_FOR_ONE_STEP);
    const coins = (await apiClient.GET("/me")).data?.wallet.coins ?? 0;

    const result = await claim(1);

    expect(result).toEqual(
      expect.objectContaining({ duplicate: false, reward: { currency: "coin", amount: 200 } }),
    );
    expect(result.wallet?.coins).toBe(coins + 200);
    expect((await track())[0]?.state).toBe("claimed");
  });

  test("answers a repeat as a duplicate without paying again", async () => {
    winMatches(WINS_FOR_ONE_STEP);
    const first = await claim(1);

    const repeat = await claim(1);

    expect(repeat.duplicate).toBe(true);
    expect(repeat.wallet?.coins).toBe(first.wallet?.coins);
  });
});
