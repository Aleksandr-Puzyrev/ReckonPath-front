import { levelProblemsOf } from "./level-problem";

describe("levelProblemsOf", () => {
  test("reads the problems of the error details", () => {
    expect(
      levelProblemsOf({ problems: [{ code: "bridge", message: "Мост", cells: [[1, 2]] }] }),
    ).toEqual([{ code: "bridge", message: "Мост", cells: [[1, 2]] }]);
  });

  test("gives no problems for broken details", () => {
    expect(levelProblemsOf({ problems: [{ code: 1 }] })).toEqual([]);
    expect(levelProblemsOf({})).toEqual([]);
  });
});
