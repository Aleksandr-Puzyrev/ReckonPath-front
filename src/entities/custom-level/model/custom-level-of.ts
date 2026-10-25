import type { LevelInput } from "@reckon-path/engine";

import type { CustomDraft, CustomMap, CustomParams } from "./custom-level-type";

// The editor route id of a level not saved yet (id маршрута редактора для ещё не сохранённого уровня).
export const NEW_LEVEL_ID = "new";
// The design 27.4 sheet has no default size; 6×6 is the middle of 4–9 (у листа 27.4 нет размера по умолчанию; 6×6 — середина 4–9).
export const NEW_LEVEL_SIZE = 6;
// The level schema's lowest move limit (наименьший лимит ходов по схеме уровня).
export const MIN_MOVE_LIMIT = 1;
// Part 1 §7.4: by default the limit is the bot estimate + 50 % (Часть 1 §7.4: по умолчанию лимит — оценка бота + 50 %).
const DEFAULT_LIMIT_SHARE = 1.5;

export const levelIdOf = (savedId: string | null) => `u-${savedId ?? NEW_LEVEL_ID}`;

export const defaultMoveLimit = (norm: number) => Math.ceil(norm * DEFAULT_LIMIT_SHARE);

export const levelOfDraft = (
  { title, map, params }: CustomDraft,
  savedId: string | null,
  norm: number | null,
): LevelInput => ({
  ...map,
  v: 2,
  id: levelIdOf(savedId),
  title: { ru: title, en: title },
  probeMode: params.probeMode,
  fog: params.fog,
  targetOrder: params.isTargetOrder,
  bombHint: params.hasBombHint,
  moveLimit: params.moveLimit ?? (norm === null ? null : defaultMoveLimit(norm)),
});

const DEFAULT_PARAMS: CustomParams = {
  probeMode: "distance",
  fog: null,
  isTargetOrder: false,
  hasBombHint: true,
  moveLimit: null,
};

export const emptyDraft = (
  title: string,
  rows: number,
  cols: number,
  probeMode: CustomParams["probeMode"],
): CustomDraft => ({
  title,
  map: { rows, cols, targets: [] },
  params: { ...DEFAULT_PARAMS, probeMode },
});

// The server keeps the level; the editor works on its map, parameters and title (сервер хранит уровень; редактор работает с его картой, параметрами и названием).
export const draftOfLevel = (level: LevelInput): CustomDraft => {
  const { rows, cols, targets, bombs, streams, bridges, heavy, rocks, fences, beacons, buoys } =
    level;
  const map: CustomMap = {
    rows,
    cols,
    targets,
    bombs,
    streams,
    bridges,
    heavy,
    rocks,
    fences,
    beacons,
    buoys,
  };
  return {
    title: level.title?.ru ?? level.title?.en ?? "",
    map,
    params: {
      probeMode: level.probeMode,
      fog: level.fog ?? null,
      isTargetOrder: level.targetOrder ?? false,
      hasBombHint: level.bombHint ?? true,
      moveLimit: level.moveLimit ?? null,
    },
  };
};

// A user level's title is the same in both languages, but a code may carry either one (название пользовательского уровня одно на оба языка, но код может нести любое из двух).
export const customLevelTitleOf = (level: LevelInput, language: string) =>
  (language === "en"
    ? (level.title?.en ?? level.title?.ru)
    : (level.title?.ru ?? level.title?.en)) ?? "";
