import { jumpDirectionOf } from "./jump-direction";

describe("jumpDirectionOf", () => {
  test("hides the jump while the current row is visible", () => {
    expect(jumpDirectionOf(4, [2, 3, 4, 5])).toBeNull();
  });

  test("points down when the current row is below the screen", () => {
    expect(jumpDirectionOf(9, [0, 1, 2])).toBe("down");
  });

  test("points up when the current row is above the screen", () => {
    expect(jumpDirectionOf(1, [5, 6, 7])).toBe("up");
  });

  test("hides the jump without a current level", () => {
    expect(jumpDirectionOf(null, [0, 1])).toBeNull();
  });
});
