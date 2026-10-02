// The content scripts run in Node through Jest (скрипты контента работают в Node через Jest).
/// <reference types="node" />
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import type { LevelInput } from "@reckon-path/engine";

import { CAMPAIGN } from "./campaign";
import { checkLevel, formatReport } from "./check/check-level";

const LEVELS_DIR = join(__dirname, "..", "levels");
const JSON_INDENT = 2;
const shouldWrite = process.env.CONTENT_WRITE === "1";
const shouldReport = process.env.CONTENT_REPORT === "1" || shouldWrite;

const checkAll = (levels: readonly LevelInput[]) =>
  levels.map((level, index) => checkLevel(level, index + 1));

const withComputedLimits = (levels: readonly LevelInput[]) => {
  const reports = checkAll(levels);
  return levels.map((level, index) => {
    const expected = reports[index]?.expected;
    return expected === null || expected === undefined ? level : { ...level, ...expected };
  });
};

// `content:fix` writes the computed limits back and checks the written levels, so it passes in one run (content:fix записывает лимиты и проверяет записанное, поэтому проходит за один запуск).
const levels = shouldWrite ? withComputedLimits(CAMPAIGN) : CAMPAIGN;
if (shouldWrite) {
  levels.forEach((level) =>
    writeFileSync(
      join(LEVELS_DIR, `${level.id}.json`),
      `${JSON.stringify(level, null, JSON_INDENT)}\n`,
    ),
  );
}
const reports = checkAll(levels);
if (shouldReport) process.stdout.write(`\n${formatReport(reports)}\n`);

describe("campaign content", () => {
  test.each(reports.map((report) => [report.id, report] as const))(
    "%s passes the checks",
    (_id, report) => {
      expect(report.errors).toEqual([]);
    },
  );

  test("numbers the levels c-1 … c-N in order", () => {
    expect(CAMPAIGN.map(({ id }) => id)).toEqual(CAMPAIGN.map((_, index) => `c-${index + 1}`));
  });
});
