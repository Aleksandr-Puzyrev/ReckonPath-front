export interface StreakMilestone {
  days: number;
  emeralds: number;
}

// TODO: read the milestone rewards from remote config once it carries them
export const STREAK_MILESTONES: readonly StreakMilestone[] = [
  { days: 3, emeralds: 5 },
  { days: 7, emeralds: 15 },
  { days: 14, emeralds: 30 },
  { days: 30, emeralds: 60 },
];

export const nextMilestoneOf = (days: number) =>
  STREAK_MILESTONES.find((milestone) => days < milestone.days) ?? null;
