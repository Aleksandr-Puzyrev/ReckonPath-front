import type { components } from "@shared/api";

export type Leaderboard = components["schemas"]["Leaderboard"];
export type LeaderboardRow = components["schemas"]["LeaderboardRow"];
export type LeaderboardPeriod = components["schemas"]["LeaderboardPeriod"];
export type LeaderboardScope = Extract<
  components["schemas"]["LeaderboardScope"],
  "all" | "friends"
>;
