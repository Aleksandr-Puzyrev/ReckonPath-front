import { cellsRange } from "./cells-range";

describe("cellsRange", () => {
  test("names one tile", () => {
    expect(cellsRange([[4, 3]])).toBe("D5");
  });

  test("spans the tiles from the top-left to the bottom-right corner", () => {
    expect(
      cellsRange([
        [4, 3],
        [5, 4],
        [4, 4],
      ]),
    ).toBe("D5–E6");
  });
});
