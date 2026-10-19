import type { components } from "@shared/api";

import type { PvpMap } from "./arena-map-type";
import { checkEditorMap } from "./check-editor-map";

const BRONZE: components["schemas"]["ArenaFormat"] = {
  size: 5,
  targets: 1,
  turnSec: 5,
  bombHint: true,
  limits: { fence: 3, stream: 3, heavy: 1, rock: 2, bridge: 1, bomb: 2 },
};

const VALID: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [[2, 2]],
  bombs: [
    [0, 0],
    [4, 4],
  ],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ],
};

describe("checkEditorMap", () => {
  test("accepts a valid map with the bot norm", () => {
    expect(checkEditorMap(VALID, BRONZE)).toEqual({ kind: "valid", norm: expect.any(Number) });
  });

  test("calls a map the bot solves in under 3 moves too easy", () => {
    const easy: PvpMap = { rows: 5, cols: 5, targets: [[4, 4]], bombs: [[4, 0]] };

    expect(checkEditorMap(easy, BRONZE)).toEqual({ kind: "trivial", norm: 2 });
  });

  test("asks for the format's targets", () => {
    expect(checkEditorMap({ ...VALID, targets: [] }, BRONZE)).toEqual({
      kind: "targets",
      count: 1,
    });
  });

  test("names the tiles cut off by fences (ARN-16)", () => {
    const map: PvpMap = {
      ...VALID,
      fences: [
        [
          [0, 0],
          [0, 1],
        ],
        [
          [0, 0],
          [1, 0],
        ],
      ],
    };

    expect(checkEditorMap(map, BRONZE)).toEqual({ kind: "isolated", cells: [[0, 0]] });
  });

  test("reports a bridge off a stream", () => {
    expect(checkEditorMap({ ...VALID, bridges: [[2, 2]] }, BRONZE)).toEqual({
      kind: "bridge",
      cells: [[2, 2]],
    });
  });
});
