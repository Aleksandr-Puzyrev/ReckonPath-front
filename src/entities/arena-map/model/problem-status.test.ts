import type { MatchFormat, PvpMap } from "./arena-map-type";
import { statusOfProblem } from "./problem-status";

const FORMAT: MatchFormat = {
  rows: 5,
  cols: 6,
  targets: 1,
  moveSeconds: 10,
  league: "bronze",
  leagueTitle: "Bronze",
  caps: { fences: 3, stream: 3, heavy: 1, rock: 2, bridge: 1, bombs: 2 },
};

const MAP: PvpMap = { rows: 5, cols: 6, targets: [[2, 2]] };

describe("statusOfProblem", () => {
  test("shows the target count when the server counts targets", () => {
    expect(statusOfProblem({ code: "targets", message: "" }, MAP, FORMAT)).toEqual({
      kind: "targets",
      count: 1,
    });
  });

  test("highlights a misplaced target as an invalid cell (target on a rock)", () => {
    expect(statusOfProblem({ code: "targets", message: "", cells: [[2, 2]] }, MAP, FORMAT)).toEqual(
      { kind: "invalid", cells: [[2, 2]] },
    );
  });

  test("marks the cut-off cells of an isolated area", () => {
    expect(statusOfProblem({ code: "cut", message: "", cells: [[0, 1]] }, MAP, FORMAT)).toEqual({
      kind: "isolated",
      cells: [[0, 1]],
    });
  });
});
