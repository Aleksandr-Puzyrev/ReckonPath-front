import { gridNeighbors } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import type { PlayView } from "@entities/level";

export const bombCoachHighlight = (
  game: Pick<PlayView, "board" | "revealed"> | null,
): Idx[] | null => {
  if (game === null) return null;
  const marked = [...game.revealed].find(([, reveal]) => "bombNear" in reveal && reveal.bombNear);
  if (marked === undefined) return null;
  const [cell] = marked;
  return [cell, ...gridNeighbors(game.board, cell).map(({ idx }) => idx)];
};
