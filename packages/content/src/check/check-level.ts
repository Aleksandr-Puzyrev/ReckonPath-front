import { computeNorm, createBoard, validateLevel, validateLevelNorm } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { TUTORIAL_LEVEL, WORLD_PLANS } from "../world-plans";

import { firstNumberShare } from "./first-tap";
import { expectedFactor, limitsFor } from "./level-limits";
import type { LevelLimits } from "./level-limits";

const MAX_FIRST_NUMBER_SHARE = 0.6;
const MAX_CURVE_DEVIATION = 0.1;
const CAMPAIGN = { kind: "campaign" } as const;

export interface LevelReport {
  id: string;
  number: number;
  norm: number;
  moveLimit: number | null;
  expected: LevelLimits | null;
  factor: number | null;
  deviation: number | null;
  firstNumberShare: number;
  errors: string[];
  warnings: string[];
}

export const checkLevel = (level: LevelInput, number: number): LevelReport => {
  const { board, rules } = createBoard(level);
  const norm = computeNorm(board, rules, level.id);
  const isTutorial = level.id === TUTORIAL_LEVEL;
  const plan = WORLD_PLANS.find(
    ({ firstLevel, lastLevel }) => number >= firstLevel && number <= lastLevel,
  );
  const factor = plan === undefined || isTutorial ? null : expectedFactor(plan, number, level.id);
  const expected = factor === null ? null : limitsFor(norm.norm, factor);
  const moveLimit = level.moveLimit ?? null;
  const slack = moveLimit === null ? null : moveLimit / norm.norm;
  const deviation = slack === null || factor === null ? null : Math.abs(slack - factor) / factor;
  const firstShare = firstNumberShare(level);

  const normCodes = validateLevelNorm(level, CAMPAIGN, norm).map(({ code }) => code);
  const errors = [
    ...validateLevel(level, CAMPAIGN).map(({ code }) => code),
    ...normCodes.filter((code) => !(isTutorial && code === "MOVE_LIMIT")),
    ...(plan === undefined ? ["NO_WORLD_PLAN"] : []),
    ...(isTutorial && (level.moveLimit != null || level.stars != null) ? ["TUTORIAL_LIMIT"] : []),
    ...(expected !== null &&
    (moveLimit !== expected.moveLimit ||
      level.stars?.[0] !== expected.stars[0] ||
      level.stars?.[1] !== expected.stars[1])
      ? ["LIMITS_OUT_OF_DATE"]
      : []),
    ...(firstShare > MAX_FIRST_NUMBER_SHARE ? ["FIRST_NUMBER"] : []),
  ];
  const warnings = deviation !== null && deviation > MAX_CURVE_DEVIATION ? ["CURVE"] : [];

  return {
    id: level.id,
    number,
    norm: norm.norm,
    moveLimit,
    expected,
    factor,
    deviation,
    firstNumberShare: firstShare,
    errors,
    warnings,
  };
};

const PERCENT = 100;
const COLUMNS = ["#", "id", "norm", "limit", "slack", "plan", "dev %", "1st number %", "issues"];

const cell = (value: number | null, digits = 2) => (value === null ? "—" : value.toFixed(digits));

export const formatReport = (reports: readonly LevelReport[]) => {
  const rows = reports.map((report) => [
    String(report.number),
    report.id,
    cell(report.norm),
    report.moveLimit === null ? "—" : String(report.moveLimit),
    report.moveLimit === null ? "—" : cell(report.moveLimit / report.norm),
    cell(report.factor),
    report.deviation === null ? "—" : cell(report.deviation * PERCENT, 0),
    cell(report.firstNumberShare * PERCENT, 0),
    [...report.errors, ...report.warnings].join(", ") || "ok",
  ]);
  return [COLUMNS, ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");
};
