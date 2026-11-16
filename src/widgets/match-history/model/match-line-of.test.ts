import { i18n } from "@shared/i18n";

import { matchLineOf } from "./match-line-of";

const match = (overrides: Partial<Parameters<typeof matchLineOf>[0]>) => ({
  matchId: "m1",
  kind: "duel" as const,
  outcome: "win" as const,
  reason: "targets",
  rival: { id: "u2", name: "Kira" },
  moves: 9,
  rivalMoves: 8,
  trophies: 32,
  finishedAt: "2026-10-18T12:00:00Z",
  ...overrides,
});

describe("matchLineOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows the outcome and my moves", () => {
    expect(matchLineOf(match({}), i18n.t)).toBe("Победа · 9 ходов");
    expect(matchLineOf(match({ outcome: "loss", moves: 2 }), i18n.t)).toBe("Поражение · 2 хода");
  });

  test("marks a bot match as training", () => {
    expect(matchLineOf(match({ kind: "bot", outcome: "draw" }), i18n.t)).toBe(
      "Ничья · 9 ходов · тренировочный",
    );
  });

  test("shows a map match without moves", () => {
    expect(matchLineOf(match({ kind: "map" }), i18n.t)).toBe("Победа · против карты");
  });
});
