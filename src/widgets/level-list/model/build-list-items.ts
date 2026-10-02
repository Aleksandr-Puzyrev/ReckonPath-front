import type { CampaignLevel, CampaignWorld } from "@entities/level";
import {
  currentLevelId,
  isWorldPerfect,
  isWorldUnlocked,
  levelStateOf,
  maxStarsOf,
  starsOf,
} from "@entities/progress";
import type { LevelBest, LevelState } from "@entities/progress";

export interface WorldItem {
  type: "world";
  key: string;
  world: CampaignWorld;
  isUnlocked: boolean;
  isPerfect: boolean;
  stars: number;
  maxStars: number;
}

export interface LevelItem {
  type: "level";
  key: string;
  campaignLevel: CampaignLevel;
  state: LevelState;
  best: LevelBest | null;
}

export type ListItem = WorldItem | LevelItem;

export const buildListItems = (
  worlds: readonly CampaignWorld[],
  best: Readonly<Record<string, LevelBest>>,
): ListItem[] => {
  const currentId = currentLevelId(worlds, best);

  return worlds.flatMap((world): ListItem[] => {
    const isUnlocked = isWorldUnlocked(world, currentId, best);
    const header: WorldItem = {
      type: "world",
      key: `world-${world.number}`,
      world,
      isUnlocked,
      isPerfect: isWorldPerfect(world, best),
      stars: starsOf(world, best),
      maxStars: maxStarsOf(world),
    };
    if (!isUnlocked) return [header];

    return [
      header,
      ...world.levels.map((campaignLevel): LevelItem => ({
        type: "level",
        key: campaignLevel.level.id,
        campaignLevel,
        state: levelStateOf(campaignLevel.level.id, currentId, best),
        best: best[campaignLevel.level.id] ?? null,
      })),
    ];
  });
};

export const currentItemIndex = (items: readonly ListItem[]) => {
  const index = items.findIndex((item) => item.type === "level" && item.state === "current");
  return index === -1 ? null : index;
};
