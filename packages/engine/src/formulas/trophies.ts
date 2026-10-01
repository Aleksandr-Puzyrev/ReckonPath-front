import { DEFAULT_ENGINE_CONFIG, type RatingConfig } from "../config/engine-config";

import { leagueOf } from "./league";
import { isReduced, REDUCED_REWARD_SHARE } from "./match-result";
import type { MatchKind, MatchOutcome } from "./match-result";

const DRAW_DIVISOR = 50;
const DRAW_CAP = 5;
const SEASON_RESET_THRESHOLD = 2000;
const SEASON_RESET_DIVISOR = 2;

export const roundHalfAwayFromZero = (value: number) => {
  const rounded = Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
  // Normalises -0 to 0 so results match Go and JSON (приводит -0 к 0, чтобы совпадать с Go и JSON).
  return rounded === 0 ? 0 : rounded;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface TrophyDeltaInput {
  myTrophies: number;
  opponentTrophies: number;
  outcome: MatchOutcome;
  kind: MatchKind;
}

export const trophyDelta = (
  { myTrophies, opponentTrophies, outcome, kind }: TrophyDeltaInput,
  config: RatingConfig = DEFAULT_ENGINE_CONFIG.rating,
) => {
  if (kind === "friendly") return 0;

  const delta = opponentTrophies - myTrophies;
  const base = {
    win: clamp(roundHalfAwayFromZero(config.base + delta / config.divisor), config.min, config.max),
    loss: -clamp(
      roundHalfAwayFromZero(config.base - delta / config.divisor),
      config.min,
      config.max,
    ),
    draw: clamp(roundHalfAwayFromZero(delta / DRAW_DIVISOR), -DRAW_CAP, DRAW_CAP),
  }[outcome];

  const isBronzeLoss = outcome === "loss" && leagueOf(myTrophies) === "bronze";
  const capped = isBronzeLoss ? Math.max(base, -config.bronzeLossCap) : base;

  return isReduced(kind) ? roundHalfAwayFromZero(capped * REDUCED_REWARD_SHARE) : capped;
};

export const applyTrophies = (trophies: number, delta: number, seasonFloor: number) =>
  Math.max(0, Math.max(trophies + delta, seasonFloor));

export const seasonReset = (trophies: number) =>
  trophies > SEASON_RESET_THRESHOLD
    ? SEASON_RESET_THRESHOLD +
      Math.floor((trophies - SEASON_RESET_THRESHOLD) / SEASON_RESET_DIVISOR)
    : trophies;
