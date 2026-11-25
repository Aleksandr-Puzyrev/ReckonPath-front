import { medalOf } from "./medal-of";

describe("medalOf", () => {
  test.each([
    [1, "gold"],
    [2, "silver"],
    [3, "bronze"],
    [4, "none"],
    [null, "none"],
  ] as const)("gives place %s the %s medal", (rank, medal) => {
    expect(medalOf(rank)).toBe(medal);
  });
});
