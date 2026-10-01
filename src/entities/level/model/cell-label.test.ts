import { cellLabel } from "./cell-label";

describe("cellLabel", () => {
  test("names the column by letter and the row from 1", () => {
    expect(cellLabel(5, 0)).toBe("A1");
    expect(cellLabel(5, 8)).toBe("D2");
    expect(cellLabel(9, 80)).toBe("I9");
  });
});
