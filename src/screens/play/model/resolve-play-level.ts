import type { LevelInput } from "@reckon-path/engine";

import { dailyLevelOf, dayKeyOf, dayKeyOfLevelId } from "@entities/daily";

export type DailyPlayLevel =
  | { kind: "daily"; level: LevelInput; dayKey: string }
  | { kind: "dailyLocked" }
  | { kind: "missing" };

interface PlayContext {
  isUnlocked: boolean;
  now: number;
  savedLevelId: string | null;
  dailyOverride: (dayKey: string) => unknown;
}

// Only today's daily is played; a game started yesterday may still be finished (играется только сегодняшний дейли; начатую вчера партию можно доиграть).
export const resolveDailyLevel = (id: string, context: PlayContext): DailyPlayLevel => {
  const dayKey = dayKeyOfLevelId(id);
  if (dayKey === null) return { kind: "missing" };
  if (dayKey !== dayKeyOf(context.now) && context.savedLevelId !== id) return { kind: "missing" };
  if (!context.isUnlocked) return { kind: "dailyLocked" };
  return { kind: "daily", level: dailyLevelOf(dayKey, context.dailyOverride(dayKey)), dayKey };
};
