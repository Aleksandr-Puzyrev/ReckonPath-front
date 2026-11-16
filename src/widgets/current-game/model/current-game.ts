import type { CampaignLevel, CampaignOverview, CampaignWorld } from "@entities/level";

const MAX_STARS = 3;

interface ActiveGame {
  found: number;
  total: number;
}

export type CurrentGame =
  | { kind: "level"; level: CampaignLevel; world: CampaignWorld; active: ActiveGame | null }
  | { kind: "done"; total: number; belowThree: readonly CampaignLevel[] };

export const currentGameOf = (overview: CampaignOverview): CurrentGame | null => {
  const levels = overview.worlds.flatMap(({ levels: worldLevels }) => worldLevels);
  if (overview.completed) {
    return {
      kind: "done",
      total: levels.length,
      belowThree: levels.filter(({ stars }) => stars < MAX_STARS),
    };
  }
  const world = overview.worlds.find(({ levels: worldLevels }) =>
    worldLevels.some(({ number }) => number === overview.currentLevel),
  );
  const level = world?.levels.find(({ number }) => number === overview.currentLevel);
  if (world === undefined || level === undefined) return null;
  const { active } = overview;
  return {
    kind: "level",
    level,
    world,
    active: active?.level === level.number ? { found: active.found, total: active.total } : null,
  };
};
