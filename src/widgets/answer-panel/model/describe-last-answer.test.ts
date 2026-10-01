import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";

import { i18n } from "@shared/i18n";

import { describeLastAnswer } from "./describe-last-answer";

const makeGame = (overrides: Record<string, unknown> = {}) => {
  const level = levelSchema.parse({
    v: 2,
    id: "u-test",
    rows: 5,
    cols: 5,
    targets: [[4, 4]],
    probeMode: "distance",
    ...overrides,
  });
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};

describe("describeLastAnswer", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("invites the first tap", () => {
    expect(describeLastAnswer(i18n.t, makeGame(), null)).toEqual({
      title: "Тапни по клетке",
      subtitle: "Число покажет шаги до сигнала",
      tone: "normal",
    });
  });

  test("shows the bearing with its heat", () => {
    const game = applyTap(makeGame(), 23).state;
    expect(describeLastAnswer(i18n.t, game, 23)).toEqual({
      title: "D5 → 1 · горячо",
      subtitle: "Сигнал в 1 шаге",
      tone: "hot",
    });
  });

  test("reports a bomb", () => {
    const game = applyTap(makeGame({ bombs: [[0, 0]] }), 0).state;
    expect(describeLastAnswer(i18n.t, game, 0)).toMatchObject({
      title: "A1 · бомба!",
      subtitle: "Бум. Минус два хода",
      tone: "danger",
    });
  });

  test("adds the bomb hint and the fog note", () => {
    const game = applyTap(makeGame({ bombs: [[0, 1]], fog: 3 }), 0).state;
    expect(describeLastAnswer(i18n.t, game, 0).subtitle).toBe(
      "Сигнал в 8 шагах · рядом бомба · туман: видно 3",
    );
  });
});
