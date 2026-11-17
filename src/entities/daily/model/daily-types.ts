import type { fetchDaily, fetchDailyGame, fetchDailyLeaderboard } from "../api/daily-queries";

export type DailyOverview = Awaited<ReturnType<typeof fetchDaily>>;
export type DailyDay = DailyOverview["day"];
export type DailyRewards = DailyOverview["rewards"];
export type DailyGame = Awaited<ReturnType<typeof fetchDailyGame>>;
export type DailyGameResult = NonNullable<DailyGame["result"]>;
export type DailyLeaderboard = Awaited<ReturnType<typeof fetchDailyLeaderboard>>;
export type DailyEntry = DailyLeaderboard["entries"][number];
