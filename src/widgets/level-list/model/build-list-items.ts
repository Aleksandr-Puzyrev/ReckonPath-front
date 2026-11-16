import type { CampaignLevel, CampaignWorld, LevelState } from "@entities/level";

export type RowState = "done" | "current" | "locked";

export interface WorldItem {
  type: "world";
  key: string;
  world: CampaignWorld;
  isUnlocked: boolean;
  isPerfect: boolean;
}

export interface LevelItem {
  type: "level";
  key: string;
  level: CampaignLevel;
  state: RowState;
}

export type ListItem = WorldItem | LevelItem;

const ROW_STATES: Record<LevelState, RowState> = {
  locked: "locked",
  current: "current",
  done: "done",
  perfect: "done",
};

export const buildListItems = (worlds: readonly CampaignWorld[]): ListItem[] =>
  worlds.flatMap((world): ListItem[] => {
    const isUnlocked = world.state !== "locked";
    const header: WorldItem = {
      type: "world",
      key: `world-${world.number}`,
      world,
      isUnlocked,
      isPerfect: world.state === "perfect",
    };
    if (!isUnlocked) return [header];

    return [
      header,
      ...world.levels.map((level): LevelItem => ({
        type: "level",
        key: `level-${level.number}`,
        level,
        state: ROW_STATES[level.state],
      })),
    ];
  });

export const currentItemIndex = (items: readonly ListItem[]) => {
  const index = items.findIndex((item) => item.type === "level" && item.state === "current");
  return index === -1 ? null : index;
};
