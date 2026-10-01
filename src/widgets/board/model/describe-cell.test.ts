import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";

import { i18n } from "@shared/i18n";

import { cellAccessibilityLabel, describeRevealedCell } from "./describe-cell";

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

describe("describeRevealedCell", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows the bearing of an opened cell", () => {
    const game = applyTap(makeGame(), 0).state;
    expect(describeRevealedCell(i18n.t, game, 0)).toBe("A1: пеленг 6");
  });

  test("marks a bearing from before the find and a bomb nearby", () => {
    const start = makeGame({
      targets: [
        [3, 3],
        [0, 2],
      ],
      bombs: [[1, 0]],
    });
    const game = applyTap(applyTap(start, 0).state, 2).state;
    expect(describeRevealedCell(i18n.t, game, 0)).toBe(
      "A1: пеленг 2 (до находки цели) · рядом бомба",
    );
  });

  test("returns null for a closed cell", () => {
    expect(describeRevealedCell(i18n.t, makeGame(), 0)).toBeNull();
  });
});

describe("cellAccessibilityLabel", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("names a closed stream cell", () => {
    const game = makeGame({ streams: [[0, 1]] });
    expect(cellAccessibilityLabel(i18n.t, game, 1, false)).toBe("Клетка B1, ручей, закрыта");
  });

  test("names a flagged cell", () => {
    expect(cellAccessibilityLabel(i18n.t, makeGame(), 0, true)).toBe("Клетка A1, флажок");
  });
});
