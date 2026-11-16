import { i18n } from "@shared/i18n";
import { doneMatchMock } from "@shared/test-utils/api-mock";

import { resultReasonOf } from "./result-reason";

const withResult = (
  outcome: "win" | "loss" | "draw",
  reason: NonNullable<ReturnType<typeof doneMatchMock>["result"]>["reason"],
) => {
  const match = doneMatchMock();
  if (match.result === undefined) throw new Error("No result");
  return {
    ...match,
    me: { ...match.me, moves: 9 },
    rival: { ...match.rival, moves: 8 },
    result: { ...match.result, outcome, reason },
  };
};

describe("resultReasonOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("counts the winner's moves for a win by targets", () => {
    expect(resultReasonOf(withResult("win", "targets"), i18n.t)).toBe(
      "Все сигналы найдены за 9 ходов",
    );
    expect(resultReasonOf(withResult("loss", "targets"), i18n.t)).toBe(
      "Все сигналы найдены за 8 ходов",
    );
  });

  test("names the backend's reasons", () => {
    expect(resultReasonOf(withResult("draw", "equal"), i18n.t)).toBe(
      "оба нашли все цели — правило равных ходов",
    );
    expect(resultReasonOf(withResult("loss", "timeouts"), i18n.t)).toBe("Три пропуска хода");
    expect(resultReasonOf(withResult("win", "final"), i18n.t)).toBe("Финальный ход не помог");
    expect(resultReasonOf(withResult("win", "max_turns"), i18n.t)).toBe(
      "Лимит ходов — больше целей нашёл победитель",
    );
    expect(resultReasonOf(withResult("loss", "abandoned"), i18n.t)).toBe("Время на карту вышло");
  });

  test("tells that a cancelled match left the trophies as they were", () => {
    expect(resultReasonOf(withResult("draw", "cancelled"), i18n.t)).toBe(
      "Матч отменён, кубки не изменились",
    );
  });

  test("words a surrender from the winner's side only", () => {
    expect(resultReasonOf(withResult("win", "surrender"), i18n.t)).toBe("Сдача соперника");
    expect(resultReasonOf(withResult("loss", "surrender"), i18n.t)).toBeNull();
  });

  test("compares my moves with the norm in a map match", () => {
    expect(resultReasonOf({ ...withResult("win", "norm"), norm: 12 }, i18n.t)).toBe(
      "Ты: 9 ходов · Норма: 12",
    );
  });
});
