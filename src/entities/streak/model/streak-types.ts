import type { fetchStreak } from "../api/streak-queries";

export type StreakView = Awaited<ReturnType<typeof fetchStreak>>;
export type StreakMilestone = StreakView["milestones"][number];
