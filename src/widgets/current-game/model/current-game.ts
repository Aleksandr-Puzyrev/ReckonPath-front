import type { GameState } from "@reckon-path/engine";

import {
  CAMPAIGN_LEVELS,
  CAMPAIGN_WORLDS,
  findCampaignLevel,
  replaySession,
} from "@entities/level";
import type { CampaignLevel, SessionAction } from "@entities/level";
import { currentLevelId } from "@entities/progress";
import type { LevelBest } from "@entities/progress";

const MAX_STARS = 3;

export type CurrentGame =
  | { kind: "level"; campaignLevel: CampaignLevel; game: GameState | null }
  | { kind: "done"; total: number; belowThree: readonly CampaignLevel[] };

interface SavedAttempt {
  levelId: string | null;
  actions: readonly SessionAction[];
}

export const currentGameOf = (
  best: Readonly<Record<string, LevelBest>>,
  saved: SavedAttempt,
): CurrentGame => {
  const id = currentLevelId(CAMPAIGN_WORLDS, best);
  const campaignLevel = id === null ? null : findCampaignLevel(id);
  if (campaignLevel === null) {
    return {
      kind: "done",
      total: CAMPAIGN_LEVELS.length,
      belowThree: CAMPAIGN_LEVELS.filter(({ level }) => (best[level.id]?.stars ?? 0) < MAX_STARS),
    };
  }
  const isSaved = saved.levelId === campaignLevel.level.id && saved.actions.length > 0;
  return {
    kind: "level",
    campaignLevel,
    game: isSaved ? replaySession(campaignLevel.level, saved.actions) : null,
  };
};
