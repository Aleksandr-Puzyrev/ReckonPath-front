import type { LevelBest } from "./progress-store";

export type LevelState = "locked" | "current" | "done";

interface ProgressWorld {
  levels: readonly { level: { id: string } }[];
}

type BestResults = Readonly<Record<string, LevelBest>>;

const MAX_STARS = 3;

const levelIds = (worlds: readonly ProgressWorld[]) =>
  worlds.flatMap((world) => world.levels.map(({ level }) => level.id));

export const currentLevelId = (worlds: readonly ProgressWorld[], best: BestResults) =>
  levelIds(worlds).find((id) => best[id] === undefined) ?? null;

export const levelStateOf = (
  id: string,
  currentId: string | null,
  best: BestResults,
): LevelState => {
  if (best[id] !== undefined) return "done";
  return id === currentId ? "current" : "locked";
};

// A world opens when its first level does: levels unlock one by one across worlds (мир открывается вместе с первым уровнем: уровни открываются по одному сквозь миры).
export const isWorldUnlocked = (
  world: ProgressWorld,
  currentId: string | null,
  best: BestResults,
) => {
  const [first] = world.levels;
  return first !== undefined && levelStateOf(first.level.id, currentId, best) !== "locked";
};

export const starsOf = (world: ProgressWorld, best: BestResults) =>
  world.levels.reduce((sum, { level }) => sum + (best[level.id]?.stars ?? 0), 0);

export const maxStarsOf = (world: ProgressWorld) => world.levels.length * MAX_STARS;

export const isWorldPerfect = (world: ProgressWorld, best: BestResults) =>
  world.levels.length > 0 && starsOf(world, best) === maxStarsOf(world);

export const campaignStars = (worlds: readonly ProgressWorld[], best: BestResults) =>
  worlds.reduce((sum, world) => sum + starsOf(world, best), 0);

export const campaignMaxStars = (worlds: readonly ProgressWorld[]) =>
  worlds.reduce((sum, world) => sum + maxStarsOf(world), 0);
