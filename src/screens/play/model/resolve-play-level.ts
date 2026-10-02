import type { LevelInput } from "@reckon-path/engine";

import { dailyLevelOf, dayKeyOf, dayKeyOfLevelId } from "@entities/daily";
import {
  CAMPAIGN_LEVELS,
  CAMPAIGN_WORLDS,
  findCampaignLevel,
  nextCampaignLevel,
} from "@entities/level";
import type { CampaignLevel } from "@entities/level";
import { currentLevelId, levelStateOf } from "@entities/progress";
import type { LevelBest } from "@entities/progress";
import { isDailyUnlocked } from "@features/daily-today";

export type PlayLevel =
  | { kind: "campaign"; level: LevelInput; number: number; next: CampaignLevel | null }
  | { kind: "daily"; level: LevelInput; dayKey: string }
  | { kind: "locked"; lockedBy: number }
  | { kind: "dailyLocked" }
  | { kind: "missing" };

interface PlayContext {
  best: Record<string, LevelBest>;
  now: number;
  savedLevelId: string | null;
  dailyOverride: (dayKey: string) => unknown;
}

const CAMPAIGN_MODE = "campaign";
const DAILY_MODE = "daily";

const resolveCampaign = (id: string, best: Record<string, LevelBest>): PlayLevel => {
  const campaign = findCampaignLevel(id);
  if (campaign === null) return { kind: "missing" };
  const currentId = currentLevelId(CAMPAIGN_WORLDS, best);
  if (levelStateOf(id, currentId, best) === "locked") {
    const lockedBy = CAMPAIGN_LEVELS.find(({ level }) => level.id === currentId)?.number;
    if (lockedBy !== undefined) return { kind: "locked", lockedBy };
  }
  return {
    kind: "campaign",
    level: campaign.level,
    number: campaign.number,
    next: nextCampaignLevel(id),
  };
};

// Only today's daily is played; a game started yesterday may still be finished (играется только сегодняшний дейли; начатую вчера партию можно доиграть).
const resolveDaily = (id: string, context: PlayContext): PlayLevel => {
  const dayKey = dayKeyOfLevelId(id);
  if (dayKey === null) return { kind: "missing" };
  if (dayKey !== dayKeyOf(context.now) && context.savedLevelId !== id) return { kind: "missing" };
  if (!isDailyUnlocked(context.best)) return { kind: "dailyLocked" };
  return { kind: "daily", level: dailyLevelOf(dayKey, context.dailyOverride(dayKey)), dayKey };
};

export const resolvePlayLevel = (mode: string, id: string, context: PlayContext): PlayLevel => {
  if (mode === CAMPAIGN_MODE) return resolveCampaign(id, context.best);
  if (mode === DAILY_MODE) return resolveDaily(id, context);
  return { kind: "missing" };
};
