import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";
import type { GameState } from "@reckon-path/engine";

import { buildCellVisuals } from "./cell-visuals";

const makeGame = (overrides: Record<string, unknown> = {}) => {
  const level = levelSchema.parse({
    v: 2,
    id: "u-test",
    rows: 4,
    cols: 4,
    targets: [[3, 3]],
    probeMode: "distance",
    ...overrides,
  });
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};

const tapAll = (game: GameState, cells: number[]) =>
  cells.reduce((state, cell) => applyTap(state, cell).state, game);

const defaults = { flags: [], lastCell: null, showHidden: false };

describe("buildCellVisuals", () => {
  test("shows a distance answer with its heat and marks the last tap", () => {
    const game = tapAll(makeGame(), [0]);
    const [first] = buildCellVisuals(game, { ...defaults, lastCell: 0 });
    expect(first).toMatchObject({ content: { type: "distance", value: 6 }, isLast: true });
  });

  test("shows flags only on closed cells", () => {
    const visuals = buildCellVisuals(makeGame(), { ...defaults, flags: [5] });
    expect(visuals[5]?.content).toEqual({ type: "hidden", hasFlag: true, ghost: null });
  });

  test("reveals targets and bombs as ghosts only when asked", () => {
    const game = makeGame({ bombs: [[0, 3]] });
    expect(buildCellVisuals(game, defaults)[15]?.content).toMatchObject({ ghost: null });
    const shown = buildCellVisuals(game, { ...defaults, showHidden: true });
    expect(shown[15]?.content).toMatchObject({ ghost: "target" });
    expect(shown[3]?.content).toMatchObject({ ghost: "bomb" });
  });

  test("greys out answers given before a target was found", () => {
    const game = tapAll(
      makeGame({
        targets: [
          [3, 3],
          [0, 3],
        ],
      }),
      [0, 3],
    );
    expect(buildCellVisuals(game, defaults)[0]?.isStale).toBe(true);
  });

  test("keeps only the last answers under fog, never the beacons", () => {
    const game = tapAll(makeGame({ fog: 2, beacons: [[1, 1]] }), [0, 1, 2]);
    const visuals = buildCellVisuals(game, defaults);
    expect(visuals.map((visual) => visual.isFogged).slice(0, 6)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  test("marks a found target near a bomb", () => {
    const game = tapAll(makeGame({ bombs: [[3, 2]] }), [15]);
    expect(buildCellVisuals(game, defaults)[15]).toMatchObject({
      content: { type: "target" },
      hasBombNear: true,
    });
  });
});
