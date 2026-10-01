import { cellOrigin, computeBoardGeometry, hitTest } from "./board-geometry";

describe("computeBoardGeometry", () => {
  test("follows the design proportions for a 5×5 board", () => {
    const geometry = computeBoardGeometry(5, 5, 358);
    expect(geometry).toMatchObject({ padding: 8, gap: 7, radius: 15, frameRadius: 24 });
    expect(geometry.cell).toBeCloseTo(62.8);
    expect(geometry.width).toBeCloseTo(358);
  });

  test("uses wider gaps and a smaller frame radius on a 4×4 board", () => {
    expect(computeBoardGeometry(4, 4, 358)).toMatchObject({ gap: 8, frameRadius: 20 });
  });

  test("never grows wider than 400 pt", () => {
    expect(computeBoardGeometry(9, 9, 600).width).toBeCloseTo(400);
  });

  test("keeps board numbers between 12 and 26 pt", () => {
    expect(computeBoardGeometry(4, 4, 400).fontSize).toBe(26);
    expect(computeBoardGeometry(9, 9, 300).fontSize).toBe(12);
  });
});

describe("hitTest", () => {
  const geometry = computeBoardGeometry(5, 5, 358);

  test("maps a point in a cell to its row-major index", () => {
    const { x, y } = cellOrigin(geometry, 7);
    expect(hitTest(geometry, x + 5, y + 5)).toBe(7);
  });

  test("gives a gap point to the nearest cell", () => {
    const { x, y } = cellOrigin(geometry, 0);
    const right = x + geometry.cell + 1;
    const left = x + geometry.cell + geometry.gap - 1;
    expect(hitTest(geometry, right, y + 5)).toBe(0);
    expect(hitTest(geometry, left, y + 5)).toBe(1);
  });

  test("gives the frame padding to the edge cell", () => {
    expect(hitTest(geometry, 1, 1)).toBe(0);
  });

  test("ignores points outside the board", () => {
    expect(hitTest(geometry, -1, 10)).toBeNull();
    expect(hitTest(geometry, 10, geometry.height + 1)).toBeNull();
  });
});
