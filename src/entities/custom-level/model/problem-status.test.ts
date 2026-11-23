import type { CustomMap } from "./custom-level-type";
import { customStatusOfProblem } from "./problem-status";

const MAP: CustomMap = { rows: 5, cols: 5, targets: [[2, 2]], bombs: [[0, 0]] };

describe("customStatusOfProblem", () => {
  test("shows the target count of the server", () => {
    expect(
      customStatusOfProblem({ code: "targets", message: "", min: 1, max: 5, count: 0 }, MAP),
    ).toEqual({ kind: "targets", count: 1 });
  });

  test("highlights a misplaced target", () => {
    expect(customStatusOfProblem({ code: "targets", message: "", cells: [[2, 2]] }, MAP)).toEqual({
      kind: "invalid",
      cells: [[2, 2]],
    });
  });

  test("marks cut-off cells and a dry bridge", () => {
    expect(customStatusOfProblem({ code: "cut", message: "", cells: [[0, 1]] }, MAP)).toEqual({
      kind: "isolated",
      cells: [[0, 1]],
    });
    expect(customStatusOfProblem({ code: "bridge", message: "", cells: [[1, 1]] }, MAP)).toEqual({
      kind: "bridge",
      cells: [[1, 1]],
    });
  });

  test("shows the limit of a cap with its max", () => {
    expect(
      customStatusOfProblem({ code: "caps", element: "stream", message: "", max: 12 }, MAP),
    ).toEqual({ kind: "limit", max: 12, cells: [] });
    expect(customStatusOfProblem({ code: "bombs_limit", message: "", max: 1 }, MAP)).toEqual({
      kind: "limit",
      max: 1,
      cells: [[0, 0]],
    });
  });

  test("falls back to an invalid level for other codes", () => {
    expect(customStatusOfProblem({ code: "fog_range", message: "", min: 2, max: 4 }, MAP)).toEqual({
      kind: "invalid",
      cells: [],
    });
  });
});
