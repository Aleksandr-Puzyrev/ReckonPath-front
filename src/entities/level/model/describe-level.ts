import type { TFunction } from "i18next";

import type { LevelInput } from "@reckon-path/engine";

export type LevelElement =
  "bombs" | "streams" | "bridges" | "heavy" | "rocks" | "fences" | "beacons" | "buoys";

const ELEMENTS: readonly LevelElement[] = [
  "bombs",
  "streams",
  "bridges",
  "heavy",
  "rocks",
  "fences",
  "beacons",
  "buoys",
];

export const levelElements = (level: LevelInput) =>
  ELEMENTS.flatMap((element) => {
    const count = level[element]?.length ?? 0;
    return count > 0 ? [{ element, count }] : [];
  });

export const describeLevelShape = (t: TFunction, level: LevelInput) =>
  [
    t("levels.size", { rows: level.rows, cols: level.cols }),
    t("levels.targets", { count: level.targets.length }),
  ].join(" · ");

export const describeLevel = (t: TFunction, level: LevelInput) =>
  [
    describeLevelShape(t, level),
    ...levelElements(level).map(({ element, count }) => t(`levels.element.${element}`, { count })),
  ].join(" · ");

export const describeLevelElements = (t: TFunction, level: LevelInput) =>
  levelElements(level)
    .map(({ element, count }) => t(`levels.element.${element}`, { count }))
    .join(", ");
