import { CAMPAIGN_LEVELS } from "@entities/level";
import type { LevelBest } from "@entities/progress";

export const ARENA_UNLOCK_LEVEL = 12;

const unlockLevelIds = CAMPAIGN_LEVELS.filter(({ number }) => number <= ARENA_UNLOCK_LEVEL).map(
  ({ level }) => level.id,
);

export const passedTowardsArena = (best: Record<string, LevelBest>) =>
  unlockLevelIds.filter((id) => best[id] !== undefined).length;

const unlockLevelId = unlockLevelIds.at(-1);

export const isArenaUnlocked = (best: Record<string, LevelBest>) =>
  unlockLevelId !== undefined && best[unlockLevelId] !== undefined;
