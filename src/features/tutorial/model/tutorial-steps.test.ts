import { createBoard, levelSchema } from "@reckon-path/engine";

import { canSkip, closerCells, highlightOf, isTapAllowed, stepAfterTap } from "./tutorial-steps";

const { board } = createBoard(
  levelSchema.parse({
    v: 2,
    id: "c-1",
    rows: 4,
    cols: 4,
    targets: [[1, 2]],
    probeMode: "distance",
  }),
);
const FIRST = 9;

describe("tutorial steps (Part 4 §2.2)", () => {
  test("lets only the highlighted cell be tapped first", () => {
    expect(highlightOf("tapFirst", board, FIRST)).toEqual([FIRST]);
    expect(isTapAllowed("tapFirst", board, FIRST, FIRST)).toBe(true);
    expect(isTapAllowed("tapFirst", board, FIRST, 0)).toBe(false);
  });

  test("blocks taps while the number is explained", () => {
    expect(isTapAllowed("explainNumber", board, FIRST, FIRST)).toBe(false);
  });

  test("highlights the neighbours to tap closer", () => {
    expect(closerCells(board, FIRST)).toEqual([5, 10, 13, 8]);
    expect(isTapAllowed("tapCloser", board, FIRST, 10)).toBe(true);
    expect(isTapAllowed("tapCloser", board, FIRST, 0)).toBe(false);
  });

  test("frees the board for the last step", () => {
    expect(highlightOf("findAlone", board, FIRST)).toBeNull();
    expect(isTapAllowed("findAlone", board, FIRST, 0)).toBe(true);
  });

  test("moves on after each tap step", () => {
    expect(stepAfterTap("tapFirst")).toBe("explainNumber");
    expect(stepAfterTap("tapCloser")).toBe("findAlone");
    expect(stepAfterTap("findAlone")).toBe("findAlone");
  });

  test("offers «Пропустить» on steps 1–3 only", () => {
    expect(canSkip("tapFirst")).toBe(true);
    expect(canSkip("tapCloser")).toBe(true);
    expect(canSkip("findAlone")).toBe(false);
  });
});
