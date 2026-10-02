import { dayKeyOfLevelId, useDailyRecordStore } from "@entities/daily";
import { attemptOf, levelStarsOf, useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import type { Attempt } from "@entities/outbox";

interface FinishedAttempt {
  attempt: Attempt | null;
  isRecord: boolean;
}

const NOTHING_FINISHED: FinishedAttempt = { attempt: null, isRecord: false };

export const isCountedDailyLevel = (levelId: string) => {
  const dayKey = dayKeyOfLevelId(levelId);
  return dayKey !== null && useDailyRecordStore.getState().days[dayKey] === undefined;
};

// Ends the game in progress as an attempt: a game still being played counts as lost (завершает текущую партию попыткой: ещё идущая партия засчитывается как поражение).
export const finishAttempt = (): FinishedAttempt => {
  const { game, levelId, actions, startedAt, finishedAt, finish } = useGameSessionStore.getState();
  if (game === null || levelId === null) return NOTHING_FINISHED;

  const dayKey = dayKeyOfLevelId(levelId);
  const attempt = attemptOf({
    mode: dayKey === null ? "campaign" : "daily",
    levelId,
    actions,
    startedAt,
    finishedAt: finishedAt ?? Date.now(),
    game,
  });
  useOutboxStore.getState().enqueue(attempt);
  finish();

  if (dayKey !== null) {
    useDailyRecordStore.getState().recordCounted(dayKey, {
      attemptId: attempt.attemptId,
      result: attempt.claimed.result,
      movesUsed: attempt.claimed.movesUsed,
      stars: attempt.claimed.stars,
      durationMs: attempt.durationMs ?? 0,
    });
    return { attempt, isRecord: false };
  }
  if (game.status !== "won") return { attempt, isRecord: false };
  const isRecord = useProgressStore
    .getState()
    .recordWin(levelId, { stars: levelStarsOf(game), moves: game.movesUsed });
  return { attempt, isRecord };
};
