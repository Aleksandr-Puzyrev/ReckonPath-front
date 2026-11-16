import { levelToBackend } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { CAMPAIGN } from "@reckon-path/content";

import { gradients } from "../../theme/gradients";
import en from "../../i18n/locales/en.json";
import ru from "../../i18n/locales/ru.json";

export type MockLocale = "ru" | "en";

export interface MockCampaignLevel {
  number: number;
  world: number;
  level: LevelInput;
  title: Record<MockLocale, string>;
  tutorial: string | null;
  introduces: string[];
  elements: string[];
}

export interface MockWorld {
  number: number;
  title: Record<MockLocale, string>;
  subtitle: Record<MockLocale, string>;
  colorFrom: string;
  colorTo: string;
}

// The same keys as the export for the backend (scripts/export-levels-for-backend.mjs) (те же ключи, что и в выгрузке для бэкенда).
const TUTORIALS: Readonly<Record<number, string>> = { 1: "tut_first_level", 2: "tut_moves_limit" };
const RENAMED: Readonly<Record<string, string>> = {
  multi: "multi_target",
  direction: "course",
  hotcold: "hot_cold",
};

const hasTerrain = (terrain: readonly string[], char: string) =>
  terrain.some((line) => line.includes(char));

// The elements the backend lists for a level, in its order (элементы, которые бэкенд перечисляет для уровня, в его порядке).
const elementsOf = (input: LevelInput) => {
  const level = levelToBackend(input);
  const checks: [boolean, string][] = [
    [(level.fences ?? []).length > 0, "fence"],
    [hasTerrain(level.terrain, "s"), "stream"],
    [hasTerrain(level.terrain, "b"), "bridge"],
    [hasTerrain(level.terrain, "h"), "heavy"],
    [hasTerrain(level.terrain, "r"), "rock"],
    [level.targets.length > 1, "multi_target"],
    [(level.bombs ?? []).length > 0, "bomb"],
    [(level.beacons ?? []).length > 0, "beacon"],
    [(level.buoys ?? []).length > 0, "buoy"],
    [(level.fog ?? 0) > 0, "fog"],
    [level.order === true, "order"],
    [level.mode === "hot_cold", "hot_cold"],
    [level.mode === "course", "course"],
  ];
  return checks.flatMap(([isUsed, key]) => (isUsed ? [key] : []));
};

// The mock admin introduces every element on the level where it first appears (мок-админка знакомит с каждым элементом на уровне, где он появляется впервые).
const withIntroduces = (levels: Omit<MockCampaignLevel, "introduces">[]): MockCampaignLevel[] =>
  levels.map((level, index) => {
    const before = new Set(levels.slice(0, index).flatMap(({ elements }) => elements));
    const { introduces } = level.level;
    const explicit = introduces === undefined || introduces === null ? [] : [introduces];
    const introduced = [
      ...level.elements.filter((element) => !before.has(element)),
      ...explicit.map((key) => RENAMED[key] ?? key),
    ];
    return { ...level, introduces: [...new Set(introduced)] };
  });

export const MOCK_CAMPAIGN_LEVELS: readonly MockCampaignLevel[] = withIntroduces(
  CAMPAIGN.map((level, index) => ({
    number: index + 1,
    world: level.world ?? 1,
    level,
    title: { ru: level.title?.ru ?? "", en: level.title?.en ?? "" },
    tutorial: TUTORIALS[index + 1] ?? null,
    elements: elementsOf(level),
  })),
);

const COVERS: Readonly<Record<string, { colors: readonly string[] }>> = gradients;
const NAMES: Record<MockLocale, Readonly<Record<string, string>>> = {
  ru: ru.levels.world.name,
  en: en.levels.world.name,
};
const SUBTITLES: Record<MockLocale, Readonly<Record<string, string>>> = {
  ru: ru.levels.world.subtitle,
  en: en.levels.world.subtitle,
};

const textOf = (texts: Record<MockLocale, Readonly<Record<string, string>>>, number: number) => ({
  ru: texts.ru[String(number)] ?? "",
  en: texts.en[String(number)] ?? "",
});

const coverOf = (number: number) => {
  const colors = COVERS[`world${number}`]?.colors ?? [];
  const [first = "", last = first] = [colors[0], colors.at(-1)];
  return { colorFrom: first, colorTo: last };
};

export const MOCK_WORLDS: readonly MockWorld[] = [
  ...new Set(MOCK_CAMPAIGN_LEVELS.map(({ world }) => world)),
].map((number) => ({
  number,
  title: textOf(NAMES, number),
  subtitle: textOf(SUBTITLES, number),
  ...coverOf(number),
}));
