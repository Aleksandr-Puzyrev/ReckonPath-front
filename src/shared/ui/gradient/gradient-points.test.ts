import { gradientPoints } from "./gradient-points";

describe("gradientPoints", () => {
  test("runs left to right at 90 degrees", () => {
    const { start, end } = gradientPoints(90, 100, 40);
    expect(start.x).toBeCloseTo(0);
    expect(end.x).toBeCloseTo(100);
    expect(start.y).toBeCloseTo(20);
  });

  test("runs bottom to top at 0 degrees", () => {
    const { start, end } = gradientPoints(0, 100, 40);
    expect(start.y).toBeCloseTo(40);
    expect(end.y).toBeCloseTo(0);
  });
});
