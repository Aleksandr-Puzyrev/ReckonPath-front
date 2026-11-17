import type { StreakMilestone, StreakView } from "./streak-types";

export interface StreakSummary {
  current: number;
  best: number;
  lost: number | null;
  milestones: readonly StreakMilestone[];
}

const NO_MILESTONES: readonly StreakMilestone[] = [];

// The server owns the streak; a streak a missed day broke is shown as lost (серия — на сервере; серия, оборванная пропуском, показывается как потерянная).
export const streakSummaryOf = (view: StreakView | undefined): StreakSummary => ({
  current: view?.current ?? 0,
  best: view?.best ?? 0,
  lost: view?.broken === undefined || view.broken === 0 ? null : view.broken,
  milestones: view?.milestones ?? NO_MILESTONES,
});
