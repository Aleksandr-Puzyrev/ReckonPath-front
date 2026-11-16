import { dayKeyOfLevelId, useDailyRecordStore } from "@entities/daily";
import { attemptOf, useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import type { Attempt } from "@entities/outbox";

export const isCountedDailyLevel = (levelId: string) => {
  const dayKey = dayKeyOfLevelId(levelId);
  return dayKey !== null && useDailyRecordStore.getState().days[dayKey] === undefined;
};

// Ends the daily game in progress as an attempt: a game still being played counts as lost (завершает текущую партию дейли попыткой: ещё идущая партия засчитывается как поражение).
export const finishAttempt = (): Attempt | null => {
  const { game, levelId, attemptId, actions, startedAt, finishedAt, finish } =
    useGameSessionStore.getState();
  if (game === null || levelId === null) return null;
  const dayKey = dayKeyOfLevelId(levelId);
  if (dayKey === null) {
    finish();
    return null;
  }

  const attempt = attemptOf({
    mode: "daily",
    attemptId,
    levelId,
    actions,
    startedAt,
    finishedAt: finishedAt ?? Date.now(),
    game,
  });
  useOutboxStore.getState().enqueue(attempt);
  finish();
  useDailyRecordStore.getState().recordCounted(dayKey, {
    attemptId: attempt.attemptId,
    result: attempt.claimed.result,
    movesUsed: attempt.claimed.movesUsed,
    stars: attempt.claimed.stars,
    durationMs: attempt.durationMs ?? 0,
  });
  return attempt;
};
