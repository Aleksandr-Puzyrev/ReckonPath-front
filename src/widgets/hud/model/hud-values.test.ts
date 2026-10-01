import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";

import { hudValuesOf, movesToneOf } from "./hud-values";

const makeGame = () => {
  const level = levelSchema.parse({
    v: 2,
    id: "u-test",
    rows: 5,
    cols: 5,
    targets: [[4, 4]],
    bombs: [[0, 4]],
    probeMode: "distance",
    moveLimit: 12,
    stars: [8, 10],
  });
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};

describe("hudValuesOf", () => {
  test("counts moves left and star marks on the moves bar", () => {
    const values = hudValuesOf(applyTap(makeGame(), 0).state);
    expect(values).toMatchObject({ limit: 12, movesLeft: 11, found: 0, targets: 1 });
    expect(values.starMarks?.three).toBeCloseTo(4 / 12);
    expect(values.starMarks?.two).toBeCloseTo(2 / 12);
  });

  test("shows only unexploded bombs", () => {
    const values = hudValuesOf(applyTap(makeGame(), 4).state);
    expect(values).toMatchObject({ bombsLeft: 0, hasBombs: true, movesLeft: 10 });
  });
});

describe("movesToneOf", () => {
  test.each([
    [5, "normal"],
    [3, "warning"],
    [1, "danger"],
    [null, "normal"],
  ] as const)("is %s → %s", (movesLeft, tone) => {
    expect(movesToneOf(movesLeft)).toBe(tone);
  });
});
