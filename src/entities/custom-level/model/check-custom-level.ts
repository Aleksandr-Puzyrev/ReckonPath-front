import { computeNorm, createBoard, validateLevel } from "@reckon-path/engine";
import type { ValidationError } from "@reckon-path/engine";

import { levelOfDraft } from "./custom-level-of";
import type { CustomDraft } from "./custom-level-type";

type Cell = readonly [number, number];

export type CustomStatus =
  | { kind: "valid"; norm: number }
  | { kind: "isolated"; cells: readonly Cell[] }
  | { kind: "targets"; count: number }
  | { kind: "limit"; max: number; cells: readonly Cell[] }
  | { kind: "bridge"; cells: readonly Cell[] }
  | { kind: "invalid"; cells: readonly Cell[] };

const statusOf = (error: ValidationError, draft: CustomDraft): CustomStatus => {
  if (error.code === "NOT_CONNECTED") return { kind: "isolated", cells: error.cells };
  if (error.code === "TARGET_COUNT") {
    const { expected } = error;
    return { kind: "targets", count: typeof expected === "number" ? expected : expected.min };
  }
  if (error.code === "TOO_MANY_BOMBS")
    return { kind: "limit", max: error.max, cells: draft.map.bombs ?? [] };
  if (error.code === "TOO_MANY_ROCKS") return { kind: "limit", max: error.max, cells: [] };
  if (error.code === "BRIDGE_NOT_ON_STREAM") return { kind: "bridge", cells: error.cells };
  return { kind: "invalid", cells: "cells" in error ? error.cells : [] };
};

// The bot estimate is the solver's norm of the level (оценка бота — норма решателя для уровня).
export const checkCustomLevel = (draft: CustomDraft, savedId: string | null): CustomStatus => {
  const level = levelOfDraft(draft, savedId, null);
  const [error] = validateLevel(level, { kind: "custom" });
  if (error !== undefined) return statusOf(error, draft);
  const { board, rules } = createBoard(level);
  return { kind: "valid", norm: Math.round(computeNorm(board, rules, level.id).norm) };
};
