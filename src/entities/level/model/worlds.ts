export type WorldNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface World {
  number: WorldNumber;
  firstLevel: number;
  lastLevel: number;
}

// Part 1 §3.1: 100 levels in 8 worlds; names and subtitles are i18n keys by world number (100 уровней в 8 мирах; названия и подзаголовки — ключи i18n по номеру мира).
export const WORLDS: readonly World[] = [
  { number: 1, firstLevel: 1, lastLevel: 12 },
  { number: 2, firstLevel: 13, lastLevel: 24 },
  { number: 3, firstLevel: 25, lastLevel: 36 },
  { number: 4, firstLevel: 37, lastLevel: 48 },
  { number: 5, firstLevel: 49, lastLevel: 61 },
  { number: 6, firstLevel: 62, lastLevel: 74 },
  { number: 7, firstLevel: 75, lastLevel: 87 },
  { number: 8, firstLevel: 88, lastLevel: 100 },
];
