import type { LevelInput } from "@reckon-path/engine";

import { CAMPAIGN } from "@reckon-path/content";

import { WORLDS } from "./worlds";
import type { World, WorldNumber } from "./worlds";

export interface CampaignLevel {
  level: LevelInput;
  number: number;
  world: WorldNumber;
}

export interface CampaignWorld extends World {
  levels: readonly CampaignLevel[];
}

const worldOf = (level: LevelInput): WorldNumber => {
  const world = WORLDS.find(({ number }) => number === level.world);
  if (world === undefined) throw new Error(`Level ${level.id} has no campaign world`);
  return world.number;
};

export const CAMPAIGN_LEVELS: readonly CampaignLevel[] = CAMPAIGN.map((level, index) => ({
  level,
  number: index + 1,
  world: worldOf(level),
}));

export const CAMPAIGN_WORLDS: readonly CampaignWorld[] = WORLDS.map((world) => ({
  ...world,
  levels: CAMPAIGN_LEVELS.filter((campaignLevel) => campaignLevel.world === world.number),
}));

export const findCampaignLevel = (id: string) =>
  CAMPAIGN_LEVELS.find(({ level }) => level.id === id) ?? null;

export const nextCampaignLevel = (id: string) => {
  const index = CAMPAIGN_LEVELS.findIndex(({ level }) => level.id === id);
  return CAMPAIGN_LEVELS[index + 1] ?? null;
};
