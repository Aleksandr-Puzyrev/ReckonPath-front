import type { LevelInput } from "@reckon-path/engine";

import { mapPreviewVisualsOf } from "./map-preview-visuals";

const LEVEL: LevelInput = {
  v: 2,
  id: "u-arena-map",
  rows: 5,
  cols: 5,
  targets: [[2, 2]],
  bombs: [[0, 0]],
  probeMode: "distance",
};

describe("mapPreviewVisualsOf", () => {
  test("shows the owner's targets and bombs on closed cells", () => {
    const visuals = mapPreviewVisualsOf(LEVEL, []);

    expect(visuals[12]?.content).toEqual({ type: "hidden", hasFlag: false, ghost: "target" });
    expect(visuals[0]?.content).toEqual({ type: "hidden", hasFlag: false, ghost: "bomb" });
  });

  test("opens the tapped cells with their bearings", () => {
    const visuals = mapPreviewVisualsOf(LEVEL, [10, 12]);

    expect(visuals[10]?.content).toEqual(expect.objectContaining({ type: "distance", value: 2 }));
    expect(visuals[12]?.content.type).toBe("target");
  });
});

describe("mapPreviewVisualsOf errors", () => {
  test("marks the cells of a map error", () => {
    const visuals = mapPreviewVisualsOf(
      {
        v: 2,
        id: "u-arena-map",
        rows: 5,
        cols: 5,
        targets: [[2, 2]],
        probeMode: "distance",
      },
      [],
      [3],
    );

    expect(visuals[3]?.emphasis).toBe("error");
    expect(visuals[4]?.emphasis).toBe("none");
  });
});
