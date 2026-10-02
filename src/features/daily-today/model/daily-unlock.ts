import { CAMPAIGN_LEVELS } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import type { LevelBest } from "@entities/progress";

export const DAILY_UNLOCK_LEVEL = 6;

const unlockLevelId = CAMPAIGN_LEVELS.find(({ number }) => number === DAILY_UNLOCK_LEVEL)?.level.id;

export const isDailyUnlocked = (best: Record<string, LevelBest>) =>
  unlockLevelId !== undefined && best[unlockLevelId] !== undefined;

export const useIsDailyUnlocked = () => useProgressStore((state) => isDailyUnlocked(state.best));
