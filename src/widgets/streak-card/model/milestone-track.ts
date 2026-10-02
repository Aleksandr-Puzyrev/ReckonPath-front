import type { StreakMilestone } from "@entities/streak";

export type MilestoneState = "reached" | "next" | "ahead";

// The track fills evenly between milestones, as in the design (шкала заполняется равными долями между вехами, как в дизайне).
export const trackShareOf = (days: number, milestones: readonly StreakMilestone[]) => {
  const steps = milestones.length - 1;
  if (steps <= 0) return 0;
  const reached = milestones.filter((milestone) => days >= milestone.days).length;
  if (reached === 0) return 0;
  if (reached > steps) return 1;
  const from = milestones[reached - 1]?.days ?? 0;
  const to = milestones[reached]?.days ?? from;
  const partial = to > from ? (days - from) / (to - from) : 0;
  return (reached - 1 + partial) / steps;
};

export const milestoneStatesOf = (days: number, milestones: readonly StreakMilestone[]) => {
  const nextIndex = milestones.findIndex((milestone) => days < milestone.days);
  return milestones.map((milestone, index): MilestoneState => {
    if (days >= milestone.days) return "reached";
    return index === nextIndex ? "next" : "ahead";
  });
};
