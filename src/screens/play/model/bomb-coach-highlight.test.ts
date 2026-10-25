import { applyTap, createBoard, initGame } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { bombCoachHighlight } from "./bomb-coach-highlight";

const gameOf = (overrides: Partial<LevelInput> = {}) => {
  const { board, rules } = createBoard({
    v: 2,
    id: "c-bomb",
    rows: 4,
    cols: 4,
    targets: [[0, 3]],
    bombs: [[1, 2]],
    probeMode: "distance",
    ...overrides,
  });
  return initGame(board, rules);
};

describe("bombCoachHighlight", () => {
  test("is empty before a mine mark appears", () => {
    const game = applyTap(gameOf(), 12).state;

    expect(bombCoachHighlight(game)).toBeNull();
  });

  test("highlights the marked cell and its four neighbours (Part 4 §2.3)", () => {
    const game = applyTap(gameOf(), 5).state;

    expect(bombCoachHighlight(game)?.toSorted((a, b) => a - b)).toEqual([1, 4, 5, 6, 9]);
  });

  test("stays empty when the level hides the mine mark (LVL-BN6)", () => {
    const game = applyTap(gameOf({ bombHint: false }), 5).state;

    expect(bombCoachHighlight(game)).toBeNull();
  });
});
