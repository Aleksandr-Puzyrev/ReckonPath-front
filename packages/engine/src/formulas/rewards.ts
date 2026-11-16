export type XpSource = "levelFirstWin" | "levelRepeatWin" | "daily" | "match" | "matchWin";

const XP_BY_SOURCE: Record<XpSource, number> = {
  levelFirstWin: 10,
  levelRepeatWin: 2,
  daily: 15,
  match: 5,
  matchWin: 5,
};
const XP_BASE = 50;
const XP_PER_LEVEL = 25;

export const xpFor = (source: XpSource) => XP_BY_SOURCE[source];

export const xpToNext = (level: number) => XP_BASE + XP_PER_LEVEL * (level - 1);
