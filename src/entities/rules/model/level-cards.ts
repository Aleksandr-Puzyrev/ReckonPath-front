import type { LevelInput } from "@reckon-path/engine";

import type { RuleCardId } from "./rule-cards";

const hasAny = (cells: readonly unknown[] | undefined) => (cells ?? []).length > 0;

const ELEMENT_CARDS: readonly [RuleCardId, (level: LevelInput) => boolean][] = [
  ["direction", (level) => level.probeMode === "direction"],
  ["hotcold", (level) => level.probeMode === "hotcold"],
  ["multi", (level) => level.targets.length > 1],
  ["fence", (level) => hasAny(level.fences)],
  ["stream", (level) => hasAny(level.streams)],
  ["bridge", (level) => hasAny(level.bridges)],
  ["heavy", (level) => hasAny(level.heavy)],
  ["rock", (level) => hasAny(level.rocks)],
  ["bomb", (level) => hasAny(level.bombs)],
  ["beacon", (level) => hasAny(level.beacons)],
  ["buoy", (level) => hasAny(level.buoys)],
  ["fog", (level) => level.fog != null],
  ["order", (level) => level.targetOrder === true],
];

// Cards come from what the level contains; lessons add cards no element shows, such as flags (карточки берутся из содержимого уровня; уроки добавляют карточки без элемента, например флажки).
export const levelCardIds = (
  level: LevelInput,
  lessons: readonly RuleCardId[] = [],
): RuleCardId[] => [
  ...ELEMENT_CARDS.flatMap(([id, isUsed]) => (isUsed(level) ? [id] : [])),
  ...lessons,
];

export const modeCardId = (level: LevelInput): RuleCardId =>
  level.probeMode === "distance" ? "distance" : level.probeMode;
