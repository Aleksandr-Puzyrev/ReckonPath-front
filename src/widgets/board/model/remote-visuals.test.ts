import { createBoard } from "@reckon-path/engine";

import { remoteVisualsOf } from "./remote-visuals";

const { board, rules } = createBoard({
  v: 2,
  id: "u-arena-match",
  rows: 5,
  cols: 5,
  targets: [],
  probeMode: "distance",
});

const OPTIONS = { flags: [], pendingCell: null, isDimmed: false };

describe("remoteVisualsOf", () => {
  test("draws the server's answers on the opponent's layout", () => {
    const visuals = remoteVisualsOf(
      board,
      rules,
      [
        { cell: 0, outcome: "pelang", value: 1, bombNear: true },
        { cell: 7, outcome: "bomb", value: null, bombNear: false },
      ],
      OPTIONS,
    );

    expect(visuals[0]).toEqual(
      expect.objectContaining({
        content: { type: "distance", value: 1, heat: "hot" },
        hasBombNear: true,
      }),
    );
    expect(visuals[7]?.content).toEqual({ type: "bomb" });
    expect(visuals[7]?.isLast).toBe(true);
  });

  test("marks bearings taken before a found target as stale", () => {
    const visuals = remoteVisualsOf(
      board,
      rules,
      [
        { cell: 0, outcome: "pelang", value: 2, bombNear: false },
        { cell: 2, outcome: "target", value: null, bombNear: false },
        { cell: 4, outcome: "pelang", value: 3, bombNear: false },
      ],
      OPTIONS,
    );

    expect(visuals[0]?.isStale).toBe(true);
    expect(visuals[4]?.isStale).toBe(false);
  });

  test("shows flags, the pending tap and the dimmed board on the opponent's turn", () => {
    const visuals = remoteVisualsOf(board, rules, [], {
      flags: [3],
      pendingCell: 5,
      isDimmed: true,
    });

    expect(visuals[3]?.content).toEqual({ type: "hidden", hasFlag: true, ghost: null });
    expect(visuals[5]?.emphasis).toBe("highlight");
    expect(visuals[6]?.emphasis).toBe("dim");
  });
});
