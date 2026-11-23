import { customLimitsOf, editFormatOf } from "./edit-format";

describe("editFormatOf", () => {
  test("gives the arena edits the backend default caps (decision 0063 #3)", () => {
    expect(editFormatOf(9, 9)).toEqual({
      targets: 5,
      caps: { fences: 16, stream: 12, heavy: 8, rock: 20, bridge: 3, bombs: 5 },
    });
    expect(editFormatOf(6, 7).caps.rock).toBe(10);
  });
});

describe("customLimitsOf", () => {
  test("adds the bomb density and the feature limits", () => {
    expect(customLimitsOf({ rows: 5, cols: 5, targets: [] })).toMatchObject({
      bombs: 2,
      rocks: 6,
      beacons: 3,
      buoys: 2,
    });
  });
});
