import type { PlayView } from "@entities/level";
import type { HudCounterTone } from "@shared/ui/hud-counter";

const WARNING_MOVES = 3;
const DANGER_MOVES = 1;

export const movesToneOf = (movesLeft: number | null): HudCounterTone => {
  if (movesLeft === null) return "normal";
  if (movesLeft <= DANGER_MOVES) return "danger";
  if (movesLeft <= WARNING_MOVES) return "warning";
  return "normal";
};

export const hudValuesOf = (view: PlayView) => {
  const limit = view.moveLimit;
  const movesLeft = limit === null ? null : Math.max(0, limit - view.movesUsed);
  const thresholds = view.rules.stars;

  return {
    limit,
    movesLeft,
    movesUsed: view.movesUsed,
    found: view.foundCount,
    targets: view.targetCount,
    bombsLeft: view.bombsLeft,
    hasBombs: view.bombCount > 0,
    buoysLeft: view.buoysLeft,
    hasBuoys: view.buoyCount > 0,
    starMarks:
      // After a continue the result is at most 1★, so the star marks no longer apply (после продолжения максимум 1★, отметки звёзд больше не нужны).
      limit === null || thresholds === null || view.continued
        ? null
        : {
            three: (limit - thresholds[0]) / limit,
            // Equal thresholds leave no room for two stars (при равных порогах двух звёзд не бывает).
            two: thresholds[1] === thresholds[0] ? null : (limit - thresholds[1]) / limit,
          },
    movesShare: limit === null || movesLeft === null ? null : movesLeft / limit,
  };
};
