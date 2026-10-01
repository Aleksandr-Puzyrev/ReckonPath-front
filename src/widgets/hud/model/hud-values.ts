import { moveLimitOf } from "@reckon-path/engine";
import type { GameState } from "@reckon-path/engine";

import type { HudCounterTone } from "@shared/ui/hud-counter";

const WARNING_MOVES = 3;
const DANGER_MOVES = 1;

export const movesToneOf = (movesLeft: number | null): HudCounterTone => {
  if (movesLeft === null) return "normal";
  if (movesLeft <= DANGER_MOVES) return "danger";
  if (movesLeft <= WARNING_MOVES) return "warning";
  return "normal";
};

export const hudValuesOf = (game: GameState) => {
  const limit = moveLimitOf(game);
  const movesLeft = limit === null ? null : Math.max(0, limit - game.movesUsed);
  const { board, bombsHit, found, revealed } = game;
  const thresholds = game.rules.stars;

  return {
    limit,
    movesLeft,
    movesUsed: game.movesUsed,
    found: found.size,
    targets: board.targets.length,
    bombsLeft: board.bombs.length - bombsHit.size,
    hasBombs: board.bombs.length > 0,
    buoysLeft: board.buoys.filter((buoy) => !revealed.has(buoy)).length,
    hasBuoys: board.buoys.length > 0,
    starMarks:
      limit === null || thresholds === null
        ? null
        : {
            three: (limit - thresholds[0]) / limit,
            two: (limit - thresholds[1]) / limit,
          },
    movesShare: limit === null || movesLeft === null ? null : movesLeft / limit,
  };
};
