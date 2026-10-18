import { i18n } from "@shared/i18n";

import { matchLineOf } from "./match-line-of";

const match = (overrides: Partial<Parameters<typeof matchLineOf>[0]>) => ({
  matchId: "m1",
  mode: "ranked" as const,
  opponent: { id: "u2", nickname: "Kira", league: "GOLD", isBot: false, label: null },
  result: "win" as const,
  reason: "targets" as const,
  turns: { me: 9, opponent: 8 },
  trophiesDelta: 32,
  endedAt: "2026-10-18T12:00:00Z",
  ...overrides,
});

describe("matchLineOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows the result and my turns", () => {
    expect(matchLineOf(match({}), i18n.t)).toBe("Победа · 9 ходов");
    expect(matchLineOf(match({ result: "loss", turns: { me: 2, opponent: 3 } }), i18n.t)).toBe(
      "Поражение · 2 хода",
    );
  });

  test("marks a bot match as training", () => {
    expect(matchLineOf(match({ mode: "bot", result: "draw" }), i18n.t)).toBe(
      "Ничья · 9 ходов · тренировочный",
    );
  });

  test("shows an async match without turns and a cancelled one", () => {
    expect(matchLineOf(match({ mode: "async" }), i18n.t)).toBe("Победа · против карты");
    expect(matchLineOf(match({ result: "annulled" }), i18n.t)).toBe("Матч отменён");
  });
});
