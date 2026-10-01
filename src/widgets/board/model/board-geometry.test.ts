import { cellOrigin, computeBoardGeometry, hitTest } from "./board-geometry";

describe("computeBoardGeometry", () => {
  test("uses the design-system layout for a 5×5 board", () => {
    const geometry = computeBoardGeometry(5, 5, 358);
    expect(geometry).toMatchObject({ padding: 10, gap: 6, radius: 14 });
    expect(geometry.cell).toBeCloseTo(62.8);
    expect(geometry.width).toBeCloseTo(358);
  });

  test("never grows wider than 400 pt", () => {
    expect(computeBoardGeometry(9, 9, 600).width).toBeCloseTo(400);
  });

  test("keeps board numbers between 14 and 28 pt", () => {
    expect(computeBoardGeometry(4, 4, 400).fontSize).toBe(28);
    expect(computeBoardGeometry(9, 9, 300).fontSize).toBe(14);
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
