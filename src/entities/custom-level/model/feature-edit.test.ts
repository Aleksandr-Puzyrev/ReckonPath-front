import { eraseFeatures, toggleFeature } from "./feature-edit";
import type { CustomMap } from "./custom-level-type";

const MAP: CustomMap = { rows: 5, cols: 5, targets: [[1, 1]], rocks: [[0, 4]], bombs: [[3, 3]] };

describe("toggleFeature", () => {
  test("places and removes a beacon", () => {
    const placed = toggleFeature(MAP, "beacon", [2, 2]);
    expect(placed).toEqual({ map: { ...MAP, beacons: [[2, 2]] } });

    const removed = "map" in placed ? toggleFeature(placed.map, "beacon", [2, 2]) : placed;
    expect(removed).toEqual({ map: { ...MAP, beacons: [] } });
  });

  test("keeps features off rocks, targets, bombs and each other", () => {
    expect(toggleFeature(MAP, "buoy", [0, 4])).toEqual({ refusal: { kind: "onRock" } });
    expect(toggleFeature(MAP, "buoy", [1, 1])).toEqual({ refusal: { kind: "onHidden" } });
    expect(toggleFeature(MAP, "beacon", [3, 3])).toEqual({ refusal: { kind: "onHidden" } });
    expect(toggleFeature({ ...MAP, beacons: [[2, 2]] }, "buoy", [2, 2])).toEqual({
      refusal: { kind: "onHidden" },
    });
  });

  test("stops at 3 beacons and 2 buoys (Part 6)", () => {
    const buoys: CustomMap = {
      ...MAP,
      buoys: [
        [2, 0],
        [2, 1],
      ],
    };

    expect(toggleFeature(buoys, "buoy", [2, 2])).toEqual({ refusal: { kind: "limit", max: 2 } });
  });

  test("erases features with the tile", () => {
    expect(eraseFeatures({ ...MAP, beacons: [[2, 2]], buoys: [[2, 3]] }, [2, 2])).toMatchObject({
      beacons: [],
      buoys: [[2, 3]],
    });
  });
});
