import { BUOY_BONUS_MOVES } from "@reckon-path/engine";

import type { EventAttempt } from "@entities/competition";
import { playViewOfServerGame } from "@entities/level";

export const serverGameOfEvent = (attempt: EventAttempt) => {
  const found = attempt.cells.filter(({ kind }) => kind === "target").length;
  const bombsHit = attempt.cells.filter(({ kind }) => kind === "bomb").length;
  const buoysUsed = attempt.cells.filter(({ kind }) => kind === "buoy").length;
  const baseLimit = attempt.board.limit;
  return {
    ...attempt,
    epoch: found,
    found,
    limit: baseLimit === 0 ? 0 : baseLimit + buoysUsed * BUOY_BONUS_MOVES,
    bombsLeft: attempt.board.bombs - bombsHit,
    result: { stars: attempt.score },
  };
};

export const eventPlayView = (attempt: EventAttempt) =>
  playViewOfServerGame(serverGameOfEvent(attempt), attempt.id);
