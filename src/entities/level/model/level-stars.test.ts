import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";

import { levelStarsOf } from "./level-stars";

const winAt = (overrides: Record<string, unknown>) => {
  const level = levelSchema.parse({
    v: 2,
    id: "c-stars",
    rows: 4,
    cols: 4,
    targets: [[0, 0]],
    probeMode: "distance",
    ...overrides,
  });
  const { board, rules } = createBoard(level);
  return [1, 0].reduce((game, cell) => applyTap(game, cell).state, initGame(board, rules));
};

describe("levelStarsOf", () => {
  test("follows the level's thresholds", () => {
    expect(levelStarsOf(winAt({ moveLimit: 6, stars: [1, 2] }))).toBe(2);
  });

  test("gives three stars to the tutorial without thresholds (Part 4 §2.2)", () => {
    expect(levelStarsOf(winAt({}))).toBe(3);
  });
});
