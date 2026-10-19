import type { components } from "@shared/api";

import type { PvpMap } from "./arena-map-type";
import {
  addFence,
  countElements,
  emptyMap,
  isMapEmpty,
  limitsOf,
  paintCell,
  toggleCell,
  toggleFence,
} from "./map-edit";
import type { EditResult } from "./map-edit";

const GOLD: components["schemas"]["ArenaFormat"] = {
  size: 7,
  targets: 2,
  turnSec: 7,
  bombHint: true,
  limits: { fence: 8, stream: 7, heavy: 3, rock: 6, bridge: 2, bomb: 4 },
};

const mapOf = (result: EditResult) => {
  if ("refusal" in result) throw new Error(`Refused: ${result.refusal.kind}`);
  return result.map;
};

const refusalOf = (result: EditResult) => ("refusal" in result ? result.refusal : null);

const cells = (count: number, row = 0): [number, number][] =>
  Array.from({ length: count }, (_, col) => [row, col]);

describe("toggleCell", () => {
  test("places a target and removes it with a second tap", () => {
    const placed = mapOf(toggleCell(emptyMap(7), GOLD, "target", [1, 1]));

    expect(placed.targets).toEqual([[1, 1]]);
    expect(mapOf(toggleCell(placed, GOLD, "target", [1, 1])).targets).toEqual([]);
  });

  test("replaces terrain with terrain", () => {
    const stream = mapOf(toggleCell(emptyMap(7), GOLD, "stream", [2, 2]));

    const heavy = mapOf(toggleCell(stream, GOLD, "heavy", [2, 2]));

    expect(heavy.streams).toEqual([]);
    expect(heavy.heavy).toEqual([[2, 2]]);
  });

  test("takes the bridge away with its stream", () => {
    const stream = mapOf(toggleCell(emptyMap(7), GOLD, "stream", [2, 2]));
    const bridge = mapOf(toggleCell(stream, GOLD, "bridge", [2, 2]));

    const rock = mapOf(toggleCell(bridge, GOLD, "rock", [2, 2]));

    expect(rock.bridges).toEqual([]);
  });

  test.each([
    ["target", "rocks", "targetOnRock"],
    ["bomb", "rocks", "bombOnRock"],
    ["rock", "targets", "rockOnElement"],
    ["rock", "bombs", "rockOnElement"],
    ["bomb", "targets", "bombAndTarget"],
    ["target", "bombs", "bombAndTarget"],
  ] as const)("refuses a %s over %s and keeps the map (ARN-17)", (tool, element, kind) => {
    const map: PvpMap = { ...emptyMap(7), [element]: [[3, 3]] };

    expect(refusalOf(toggleCell(map, GOLD, tool, [3, 3]))).toEqual({ kind });
  });

  test("refuses a bridge off a stream (ARN-17)", () => {
    expect(refusalOf(toggleCell(emptyMap(7), GOLD, "bridge", [0, 0]))).toEqual({
      kind: "bridgeOffStream",
    });
  });

  test("refuses the fifth bomb on 7×7 with the limit (ARN-14, E4-1)", () => {
    const map: PvpMap = { ...emptyMap(7), bombs: cells(4) };

    expect(refusalOf(toggleCell(map, GOLD, "bomb", [5, 5]))).toEqual({ kind: "limit", max: 4 });
  });

  test("lowers the bomb limit as rocks cut passable tiles (ARN-15)", () => {
    const map: PvpMap = {
      ...emptyMap(7),
      rocks: [...cells(6, 6), [5, 0], [5, 1], [5, 2], [5, 3]],
      bombs: cells(3),
    };

    expect(limitsOf(GOLD, map).bombs).toBe(3);
    expect(refusalOf(toggleCell(map, GOLD, "bomb", [2, 2]))).toEqual({ kind: "limit", max: 3 });
  });

  test("erases everything on a tile with its fences", () => {
    const map: PvpMap = {
      ...emptyMap(7),
      targets: [[1, 1]],
      streams: [[1, 1]],
      fences: [
        [
          [1, 1],
          [1, 2],
        ],
      ],
    };

    const erased = mapOf(toggleCell(map, GOLD, "erase", [1, 1]));

    expect(isMapEmpty(erased)).toBe(true);
  });
});

describe("paintCell", () => {
  test("keeps a painted tile instead of toggling it", () => {
    const stream = mapOf(paintCell(emptyMap(7), GOLD, "stream", [0, 0]));

    expect(mapOf(paintCell(stream, GOLD, "stream", [0, 0])).streams).toEqual([[0, 0]]);
  });

  test("stops at the stream limit", () => {
    const map: PvpMap = { ...emptyMap(7), streams: cells(7) };

    expect(refusalOf(paintCell(map, GOLD, "stream", [3, 3]))).toEqual({ kind: "limit", max: 7 });
  });
});

describe("fences", () => {
  const edge: [[number, number], [number, number]] = [
    [0, 0],
    [0, 1],
  ];

  test("toggles a fence on an edge, whatever the order of its tiles", () => {
    const placed = mapOf(toggleFence(emptyMap(7), GOLD, edge));

    expect(placed.fences).toEqual([edge]);
    expect(
      mapOf(
        toggleFence(placed, GOLD, [
          [0, 1],
          [0, 0],
        ]),
      ).fences,
    ).toEqual([]);
  });

  test("adds a fence once while swiping", () => {
    const placed = mapOf(addFence(emptyMap(7), GOLD, edge));

    expect(countElements(mapOf(addFence(placed, GOLD, edge))).fences).toBe(1);
  });

  test("refuses the fence over the limit", () => {
    const map: PvpMap = {
      ...emptyMap(7),
      fences: Array.from({ length: 8 }, (_, row) => [
        [row % 7, 0],
        [row % 7, 1 + Math.floor(row / 7)],
      ]),
    };

    expect(
      refusalOf(
        addFence(map, GOLD, [
          [3, 3],
          [3, 4],
        ]),
      ),
    ).toEqual({ kind: "limit", max: 8 });
  });
});
