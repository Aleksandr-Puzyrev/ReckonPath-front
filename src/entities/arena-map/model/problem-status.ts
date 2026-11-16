import { MAX_ROCK_SHARE } from "@reckon-path/engine";

import type { MapProblem, MatchFormat, PvpMap } from "./arena-map-type";
import type { MapStatus } from "./check-editor-map";
import { countElements, limitsOf } from "./map-edit";
import type { LimitedElement } from "./map-edit";

const overCap = (map: PvpMap, format: MatchFormat) => {
  const counts = countElements(map);
  const limits = limitsOf(format, map);
  const element = (Object.keys(counts) as LimitedElement[]).find(
    (key) => counts[key] > limits[key],
  );
  return element === undefined ? null : limits[element];
};

// The server's problem codes get the editor's own texts (коды проблем сервера получают собственные тексты редактора).
const pointOf = ([row = 0, col = 0]: readonly number[]): [number, number] => [row, col];

export const statusOfProblem = (
  problem: MapProblem,
  map: PvpMap,
  format: MatchFormat,
): MapStatus => {
  const { code } = problem;
  const cells = (problem.cells ?? []).map(pointOf);
  if (code === "cut") return { kind: "isolated", cells };
  // The server also reports a misplaced target under «targets», with its cells (сервер называет «targets» и неверно поставленную цель — с её клетками).
  if (code === "targets" && cells.length > 0) return { kind: "invalid", cells };
  if (code === "targets") return { kind: "targets", count: format.targets };
  if (code === "bridge") return { kind: "bridge", cells };
  if (code === "bombs_limit") {
    return { kind: "limit", max: limitsOf(format, map).bombs, cells: map.bombs ?? [] };
  }
  if (code === "rocks_limit") {
    return { kind: "limit", max: Math.floor(map.rows * map.cols * MAX_ROCK_SHARE), cells: [] };
  }
  const max = code === "caps" ? overCap(map, format) : null;
  return max === null ? { kind: "invalid", cells } : { kind: "limit", max, cells: [] };
};
