import type { StreakView } from "@entities/streak";

// A win starts the streak over at one, so a streak that can still be restored is restored before the start (победа начинает серию заново с единицы, поэтому серию, которую ещё можно вернуть, возвращают до старта).
export const isRestoreFirst = (streak: StreakView | undefined) =>
  streak !== undefined && streak.restorable && !streak.todayDone;
