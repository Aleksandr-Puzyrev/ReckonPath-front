import type { GameEvent, Idx } from "@reckon-path/engine";

import { attemptOf, levelStarsOf, useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { haptic } from "@shared/haptics";
import { motion } from "@shared/theme";

import { hapticsForEvents } from "./haptics-for-events";

export interface TapOutcome {
  events: GameEvent[];
  isRecord: boolean;
}

let inputLockedUntil = 0;

const IGNORED: TapOutcome = { events: [], isRecord: false };

export const tapCell = (cell: Idx): TapOutcome => {
  if (Date.now() < inputLockedUntil) return IGNORED;

  const session = useGameSessionStore.getState();
  const events = session.tap(cell);
  haptic(...hapticsForEvents(events));

  if (events.some(({ type }) => type === "targetFound")) {
    inputLockedUntil = Date.now() + motion.animation.targetInputLock;
  }

  const { game, levelId, actions, startedAt, finishedAt } = useGameSessionStore.getState();
  const isWin = events.some(({ type }) => type === "win");
  if (!isWin || game === null || levelId === null) return { events, isRecord: false };

  useOutboxStore
    .getState()
    .enqueue(
      attemptOf({ levelId, actions, startedAt, finishedAt: finishedAt ?? Date.now(), game }),
    );
  const isRecord = useProgressStore
    .getState()
    .recordWin(levelId, { stars: levelStarsOf(game), moves: game.movesUsed });
  useGameSessionStore.getState().finish();
  return { events, isRecord };
};

export const unlockTapInput = () => {
  inputLockedUntil = 0;
};
