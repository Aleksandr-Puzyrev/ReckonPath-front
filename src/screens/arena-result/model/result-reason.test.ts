import { i18n } from "@shared/i18n";

import { resultReasonOf } from "./result-reason";

const end = (result: "win" | "loss" | "draw" | "annulled", reason: string) =>
  ({
    result,
    reason,
    turns: { me: 9, opponent: 8 },
  }) as Parameters<typeof resultReasonOf>[0];

describe("resultReasonOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("counts the winner's moves when all signals are found", () => {
    expect(resultReasonOf(end("win", "targets"), i18n.t)).toBe("Все сигналы найдены за 9 ходов");
    expect(resultReasonOf(end("loss", "targets"), i18n.t)).toBe("Все сигналы найдены за 8 ходов");
  });

  test("explains a draw by the equal-turns rule (PVP-10)", () => {
    expect(resultReasonOf(end("draw", "targets"), i18n.t)).toBe(
      "оба нашли все цели — правило равных ходов",
    );
  });

  test("names the opponent's surrender only for my win", () => {
    expect(resultReasonOf(end("win", "surrender"), i18n.t)).toBe("Сдача соперника");
    expect(resultReasonOf(end("loss", "surrender"), i18n.t)).toBeNull();
  });

  test("names the turn limit and a cancelled match", () => {
    expect(resultReasonOf(end("draw", "turnLimit"), i18n.t)).toBe("Лимит ходов");
    expect(resultReasonOf(end("annulled", "annulled"), i18n.t)).toBe(
      "Матч отменён, кубки не изменились",
    );
  });
});
