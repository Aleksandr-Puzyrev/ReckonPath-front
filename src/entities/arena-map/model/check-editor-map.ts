import { findDryBridges, validateLevel } from "@reckon-path/engine";
import type { PvpFormat, ValidationError } from "@reckon-path/engine";

import type { MatchFormat, PvpMap } from "./arena-map-type";
import { levelOfMap } from "./level-of-map";

type Cell = readonly [number, number];

export type MapStatus =
  | { kind: "valid" }
  | { kind: "isolated"; cells: readonly Cell[] }
  | { kind: "targets"; count: number }
  | { kind: "limit"; max: number; cells: readonly Cell[] }
  | { kind: "bridge"; cells: readonly Cell[] }
  | { kind: "invalid"; cells: readonly Cell[] };

const pvpFormatOf = ({ rows, cols, targets, caps }: MatchFormat): PvpFormat => ({
  rows,
  cols,
  targets,
  limits: {
    fences: caps.fences,
    streams: caps.stream,
    heavy: caps.heavy,
    rocks: caps.rock,
    bridges: caps.bridge,
    bombs: caps.bombs,
  },
});

const statusOf = (error: ValidationError, map: PvpMap): MapStatus => {
  if (error.code === "NOT_CONNECTED") return { kind: "isolated", cells: error.cells };
  if (error.code === "TARGET_COUNT") {
    return { kind: "targets", count: typeof error.expected === "number" ? error.expected : 0 };
  }
  if (error.code === "TOO_MANY_BOMBS") {
    return { kind: "limit", max: error.max, cells: map.bombs ?? [] };
  }
  if (error.code === "TOO_MANY_ROCKS" || error.code === "ELEMENT_LIMIT") {
    return { kind: "limit", max: error.max, cells: [] };
  }
  if (error.code === "BRIDGE_NOT_ON_STREAM") return { kind: "bridge", cells: error.cells };
  return { kind: "invalid", cells: "cells" in error ? error.cells : [] };
};

// The live check while drawing; the server has the final word on save and on «Проверить» (живая проверка при рисовании; последнее слово за сервером при сохранении и «Проверить»).
export const checkEditorMap = (map: PvpMap, format: MatchFormat): MapStatus => {
  const [error] = validateLevel(levelOfMap(map), { kind: "pvp", format: pvpFormatOf(format) });
  if (error !== undefined) return statusOf(error, map);
  const dry = findDryBridges(map);
  return dry.length > 0 ? { kind: "bridge", cells: dry } : { kind: "valid" };
};
