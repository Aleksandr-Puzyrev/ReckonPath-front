import type { CustomStatus } from "./check-custom-level";
import type { CustomMap } from "./custom-level-type";
import type { LevelProblem } from "./level-problem";

const LIMIT_CODES: readonly string[] = ["caps", "rocks_limit", "beacons_limit", "buoys_limit"];

const pointOf = ([row = 0, col = 0]: readonly number[]): [number, number] => [row, col];

// The server's problem codes get the editor's own texts, as in the arena editor (коды проблем сервера получают собственные тексты редактора, как в редакторе арены).
export const customStatusOfProblem = (problem: LevelProblem, map: CustomMap): CustomStatus => {
  const { code, min, max } = problem;
  const cells = (problem.cells ?? []).map(pointOf);
  if (code === "cut") return { kind: "isolated", cells };
  if (code === "bridge") return { kind: "bridge", cells };
  // The server also reports a misplaced target under «targets», with its cells (сервер называет «targets» и неверно поставленную цель — с её клетками).
  if (code === "targets" && cells.length === 0 && min !== undefined) {
    return { kind: "targets", count: min };
  }
  if (code === "bombs_limit" && max !== undefined) {
    return { kind: "limit", max, cells: map.bombs ?? [] };
  }
  if (LIMIT_CODES.includes(code) && max !== undefined) return { kind: "limit", max, cells: [] };
  return { kind: "invalid", cells };
};
