import { edgeKey } from "../grid/grid";

import { createBoard } from "./create-board";
import { levelSchema } from "./level-schema";

const base = { v: 2, id: "c-1-01", rows: 4, cols: 5, targets: [[3, 4]], probeMode: "distance" };

describe("levelSchema", () => {
  test("accepts a minimal level", () => {
    expect(levelSchema.safeParse(base).success).toBe(true);
  });

  test.each([
    ["an unknown format version", { ...base, v: 1 }],
    ["an id without a known prefix", { ...base, id: "x-level" }],
    ["a board larger than 9", { ...base, rows: 10 }],
    ["no targets", { ...base, targets: [] }],
    [
      "repeated cells in a list",
      {
        ...base,
        streams: [
          [0, 0],
          [0, 0],
        ],
      },
    ],
    ["a coordinate above 8", { ...base, targets: [[9, 0]] }],
    ["an unknown probe mode", { ...base, probeMode: "radar" }],
  ])("rejects %s", (_case, level) => {
    expect(levelSchema.safeParse(level).success).toBe(false);
  });
});

describe("createBoard", () => {
  test("maps cells to row-major indices and element kinds", () => {
    const level = levelSchema.parse({
      ...base,
      streams: [[0, 1]],
      heavy: [[0, 2]],
      rocks: [[1, 1]],
      bridges: [[0, 1]],
      fences: [
        [
          [2, 0],
          [2, 1],
        ],
      ],
      bombs: [[3, 0]],
    });
    const { board } = createBoard(level);

    expect(board.kinds.slice(0, 7)).toEqual([
      "open",
      "stream",
      "heavy",
      "open",
      "open",
      "open",
      "rock",
    ]);
    expect([...board.bridges]).toEqual([1]);
    expect(board.fences.has(edgeKey(10, 11))).toBe(true);
    expect(board.targets).toEqual([19]);
    expect(board.bombs).toEqual([15]);
  });

  test("applies the spec defaults for optional rules", () => {
    const { board, rules } = createBoard(levelSchema.parse(base));

    expect(rules).toEqual({
      probeMode: "distance",
      moveLimit: null,
      stars: null,
      bombHint: true,
      fog: null,
    });
    expect(board.targetOrder).toBe(false);
  });

  test("throws for a cell outside the board", () => {
    expect(() => createBoard(levelSchema.parse({ ...base, targets: [[5, 5]] }))).toThrow(
      RangeError,
    );
    expect(() =>
      createBoard(
        levelSchema.parse({
          ...base,
          fences: [
            [
              [0, 0],
              [8, 8],
            ],
          ],
        }),
      ),
    ).toThrow(RangeError);
  });
});
