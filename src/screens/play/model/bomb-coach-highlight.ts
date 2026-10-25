import { gridNeighbors } from "@reckon-path/engine";
import type { GameState, Idx } from "@reckon-path/engine";

export const bombCoachHighlight = (game: GameState | null): Idx[] | null => {
  if (game === null) return null;
  const marked = [...game.revealed].find(([, reveal]) => "bombNear" in reveal && reveal.bombNear);
  if (marked === undefined) return null;
  const [cell] = marked;
  return [cell, ...gridNeighbors(game.board, cell).map(({ idx }) => idx)];
};
