import type { LevelInput } from "@reckon-path/engine";

import { TEST_LEVELS } from "./test-levels";

export interface CampaignLevel {
  level: LevelInput;
  number: number;
}

export const CAMPAIGN_LEVELS: readonly CampaignLevel[] = TEST_LEVELS.map((level, index) => ({
  level,
  number: index + 1,
}));

export const findCampaignLevel = (id: string) =>
  CAMPAIGN_LEVELS.find(({ level }) => level.id === id) ?? null;

export const nextCampaignLevel = (id: string) => {
  const index = CAMPAIGN_LEVELS.findIndex(({ level }) => level.id === id);
  return CAMPAIGN_LEVELS[index + 1] ?? null;
};
