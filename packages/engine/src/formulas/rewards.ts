import { isReduced, REDUCED_REWARD_SHARE } from "./match-result";
import type { MatchKind, MatchOutcome } from "./match-result";

export type XpSource = "levelFirstWin" | "levelRepeatWin" | "daily" | "match" | "matchWin";

const RP_BY_OUTCOME: Record<MatchOutcome, number> = { win: 10, draw: 4, loss: 3 };
export const RP_PER_TRACK_STEP = 50;
export const TRACK_STEPS = 30;

const XP_BY_SOURCE: Record<XpSource, number> = {
  levelFirstWin: 10,
  levelRepeatWin: 2,
  daily: 15,
  match: 5,
  matchWin: 5,
};
const XP_BASE = 50;
const XP_PER_LEVEL = 25;

export const rankPoints = (outcome: MatchOutcome, kind: MatchKind) => {
  if (kind === "friendly") return 0;
  const points = RP_BY_OUTCOME[outcome];

  return isReduced(kind) ? Math.ceil(points * REDUCED_REWARD_SHARE) : points;
};

export const trackStep = (rp: number) => Math.min(TRACK_STEPS, Math.floor(rp / RP_PER_TRACK_STEP));

export const xpFor = (source: XpSource) => XP_BY_SOURCE[source];

export const xpToNext = (level: number) => XP_BASE + XP_PER_LEVEL * (level - 1);
