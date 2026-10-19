import {
  computeNorm,
  createBoard,
  PVP_SOLVER_BOMB_PENALTY,
  validateLevel,
  validateLevelNorm,
} from "@reckon-path/engine";
import type { ValidationError } from "@reckon-path/engine";

import type { components } from "@shared/api";

import type { PvpMap } from "./arena-map-type";
import { levelOfMap } from "./level-of-map";
import { pvpFormatOf } from "./pvp-format-of";

type ArenaFormat = components["schemas"]["ArenaFormat"];
type Cell = readonly [number, number];

export type MapStatus =
  | { kind: "valid"; norm: number }
  | { kind: "isolated"; cells: readonly Cell[] }
  | { kind: "targets"; count: number }
  | { kind: "limit"; max: number; cells: readonly Cell[] }
  | { kind: "bridge"; cells: readonly Cell[] }
  | { kind: "trivial"; norm: number }
  | { kind: "invalid"; cells: readonly Cell[] };

const cellsOf = (error: ValidationError) => ("cells" in error ? error.cells : []);

const statusOf = (error: ValidationError, map: PvpMap): MapStatus => {
  if (error.code === "NOT_CONNECTED") return { kind: "isolated", cells: error.cells };
  if (error.code === "TARGET_COUNT") {
    return { kind: "targets", count: typeof error.expected === "number" ? error.expected : 0 };
  }
  if (error.code === "TOO_MANY_BOMBS")
    return { kind: "limit", max: error.max, cells: map.bombs ?? [] };
  if (error.code === "TOO_MANY_ROCKS" || error.code === "ELEMENT_LIMIT") {
    return { kind: "limit", max: error.max, cells: [] };
  }
  if (error.code === "BRIDGE_NOT_ON_STREAM") return { kind: "bridge", cells: error.cells };
  return { kind: "invalid", cells: cellsOf(error) };
};

const roundNorm = (norm: number) => Math.round(norm);

export const checkEditorMap = (map: PvpMap, format: ArenaFormat): MapStatus => {
  const level = levelOfMap(map);
  const context = { kind: "pvp" as const, format: pvpFormatOf(format) };
  const [error] = validateLevel(level, context);
  if (error !== undefined) return statusOf(error, map);
  const { board, rules } = createBoard(level);
  const norm = computeNorm(board, rules, level.id, PVP_SOLVER_BOMB_PENALTY);
  if (validateLevelNorm(level, context, norm).length > 0) {
    return { kind: "trivial", norm: roundNorm(norm.norm) };
  }
  return { kind: "valid", norm: roundNorm(norm.norm) };
};
