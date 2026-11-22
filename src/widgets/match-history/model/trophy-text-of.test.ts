import { i18n } from "@shared/i18n";

import { trophyTextOf } from "./trophy-text-of";

const match = (overrides: Partial<Parameters<typeof trophyTextOf>[0]>) => ({
  matchId: "m1",
  kind: "duel" as const,
  outcome: "win" as const,
  reason: "targets",
  rival: { id: "u2", name: "Kira" },
  moves: 9,
  rivalMoves: 8,
  trophies: 0,
  finishedAt: "2026-10-18T12:00:00Z",
  ...overrides,
});

describe("trophyTextOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("marks a friendly match instead of a zero (decision 0062 #25)", () => {
    expect(trophyTextOf(match({ friendly: true }), i18n.t)).toBe("дружеский");
  });

  test("shows the trophy change of a rated match", () => {
    expect(trophyTextOf(match({ trophies: 32 }), i18n.t)).toBe("+32");
    expect(trophyTextOf(match({}), i18n.t)).toBe("0");
  });
});
