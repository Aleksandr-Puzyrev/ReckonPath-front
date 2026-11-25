import type { TFunction } from "i18next";

import type { LeaderboardPeriod } from "./leaderboard-types";

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

// Under a day the timer counts hours and minutes; the season counts started days, like the arena header (меньше суток таймер считает часы и минуты; сезон считает начатые дни, как шапка арены).
export const leaderboardTimerOf = (
  period: LeaderboardPeriod,
  endsAt: string,
  now: number,
  t: TFunction,
) => {
  const left = Math.max(0, Date.parse(endsAt) - now);
  if (left < DAY_MS) {
    const time = { h: Math.floor(left / HOUR_MS), m: Math.floor((left % HOUR_MS) / MINUTE_MS) };
    return period === "week"
      ? t("leaderboard.weekResetsSoon", time)
      : t("leaderboard.seasonLeftSoon", time);
  }
  if (period === "season") return t("leaderboard.seasonLeft", { count: Math.ceil(left / DAY_MS) });
  return t("leaderboard.weekResets", {
    d: Math.floor(left / DAY_MS),
    h: Math.floor((left % DAY_MS) / HOUR_MS),
  });
};
