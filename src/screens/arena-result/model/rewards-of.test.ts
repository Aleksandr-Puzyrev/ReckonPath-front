import type { MatchResultView } from "@entities/match";

import { rewardsOf } from "./rewards-of";

const RESULT: MatchResultView = {
  outcome: "win",
  reason: "targets",
  trophies: 16,
  trophyNow: 136,
  league: { league: "bronze", title: "Bronze", division: "III", min: 0 },
  coins: 40,
  gems: 3,
  xp: 10,
  rp: 10,
};

describe("rewardsOf", () => {
  test("lists RP, coins, emeralds and experience of a win (PVP-22, PVP-25)", () => {
    expect(rewardsOf(RESULT)).toEqual([
      { kind: "rp", amount: 10 },
      { kind: "coin", amount: 40 },
      { kind: "emerald", amount: 3 },
      { kind: "xp", amount: 10 },
    ]);
  });

  test("skips rewards the match did not give", () => {
    expect(rewardsOf({ ...RESULT, rp: 0, coins: 0, gems: 0, xp: 5 })).toEqual([
      { kind: "xp", amount: 5 },
    ]);
  });
});
