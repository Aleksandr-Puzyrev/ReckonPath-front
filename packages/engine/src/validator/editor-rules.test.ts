import {
  countEditorElements,
  DEFAULT_EDITOR_CAPS,
  defaultEditorCapsOf,
  editorLimitsOf,
  findDryBridges,
  overEditorCap,
} from "./editor-rules";
import type { EditorMap } from "./editor-rules";

const rowOfStreams = (length: number) =>
  Array.from({ length }, (_, index): [number, number] => [Math.floor(index / 5), index % 5]);

describe("countEditorElements", () => {
  test("counts a bridge apart from the water", () => {
    const map: EditorMap = {
      rows: 5,
      cols: 5,
      targets: [[4, 4]],
      streams: [
        [1, 1],
        [1, 2],
      ],
      bridges: [[1, 2]],
      beacons: [[0, 0]],
      buoys: [[0, 1]],
      fences: [
        [
          [3, 3],
          [3, 4],
        ],
      ],
    };

    expect(countEditorElements(map)).toEqual({
      targets: 1,
      fences: 1,
      streams: 1,
      heavy: 0,
      rocks: 0,
      bridges: 1,
      bombs: 0,
      beacons: 1,
      buoys: 1,
    });
  });
});

describe("defaultEditorCapsOf", () => {
  test("takes the backend default caps with the rock share of the board", () => {
    expect(defaultEditorCapsOf(9, 9)).toEqual({
      targets: 5,
      fences: 16,
      streams: 12,
      heavy: 8,
      rocks: 20,
      bridges: 3,
      bombs: 5,
      beacons: 3,
      buoys: 2,
    });
    expect(defaultEditorCapsOf(6, 7).rocks).toBe(10);
  });
});

describe("editorLimitsOf", () => {
  test("allows one bomb per 12 passable cells", () => {
    const rocks: [number, number][] = [
      [0, 0],
      [0, 1],
    ];

    expect(editorLimitsOf({ rows: 9, cols: 9, targets: [] }, DEFAULT_EDITOR_CAPS).bombs).toBe(5);
    expect(
      editorLimitsOf({ rows: 5, cols: 5, targets: [], rocks }, DEFAULT_EDITOR_CAPS).bombs,
    ).toBe(1);
  });
});

describe("overEditorCap", () => {
  test("names the first element over its cap", () => {
    const map: EditorMap = { rows: 5, cols: 5, targets: [[4, 4]], streams: rowOfStreams(13) };

    expect(overEditorCap(map, DEFAULT_EDITOR_CAPS)).toEqual({
      element: "streams",
      max: 12,
      count: 13,
    });
  });

  test("finds nothing within the caps", () => {
    const map: EditorMap = {
      rows: 5,
      cols: 5,
      targets: [[4, 4]],
      streams: rowOfStreams(13),
      bridges: [[0, 1]],
    };

    expect(overEditorCap(map, DEFAULT_EDITOR_CAPS)).toBeNull();
  });
});

describe("findDryBridges", () => {
  test("finds a bridge without water next to it", () => {
    expect(
      findDryBridges({ rows: 5, cols: 5, targets: [], streams: [[2, 2]], bridges: [[2, 2]] }),
    ).toEqual([[2, 2]]);
  });

  test("keeps a bridge next to a stream", () => {
    expect(
      findDryBridges({
        rows: 5,
        cols: 5,
        targets: [],
        streams: [
          [2, 1],
          [2, 2],
        ],
        bridges: [[2, 2]],
      }),
    ).toEqual([]);
  });
});
