import type { TFunction } from "i18next";

import type { LevelInput } from "@reckon-path/engine";

import type { PublicBoard } from "./campaign-types";

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

export const describeLevelElements = (t: TFunction, level: LevelInput) =>
  levelElements(level)
    .map(({ element, count }) => t(`levels.element.${element}`, { count }))
    .join(", ");

const TERRAIN_ELEMENTS: readonly [LevelElement, string][] = [
  ["streams", "sb"],
  ["bridges", "b"],
  ["heavy", "h"],
  ["rocks", "r"],
];

const countTerrain = (terrain: readonly string[], chars: string) =>
  terrain
    .join("")
    .split("")
    .filter((char) => chars.includes(char)).length;

// The public board counts the hidden bombs and buoys without showing them (публичная раскладка считает скрытые бомбы и буи, не показывая их).
export const publicBoardElements = (board: PublicBoard) => {
  const counts: Record<LevelElement, number> = {
    bombs: board.bombs,
    streams: 0,
    bridges: 0,
    heavy: 0,
    rocks: 0,
    fences: board.fences.length,
    beacons: board.beacons.length,
    buoys: board.buoys,
  };
  TERRAIN_ELEMENTS.forEach(([element, chars]) => {
    counts[element] = countTerrain(board.terrain, chars);
  });
  return ELEMENTS.flatMap((element) =>
    counts[element] > 0 ? [{ element, count: counts[element] }] : [],
  );
};
