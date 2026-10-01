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
      // After a continue the result is at most 1★, so the star marks no longer apply (после продолжения максимум 1★, отметки звёзд больше не нужны).
      limit === null || thresholds === null || game.continued
        ? null
        : {
            three: (limit - thresholds[0]) / limit,
            // Equal thresholds leave no room for two stars (при равных порогах двух звёзд не бывает).
            two: thresholds[1] === thresholds[0] ? null : (limit - thresholds[1]) / limit,
          },
    movesShare: limit === null || movesLeft === null ? null : movesLeft / limit,
  };
};
