import type { Stars } from "@reckon-path/engine";

import type { Attempt } from "@entities/outbox";
import { isBetter } from "@entities/progress";
import type { LevelBest } from "@entities/progress";

interface ServerLevelBest {
  id: string;
  bestStars: number;
  bestMoves: number;
}

const toStars = (value: number | null): Stars | null =>
  value === 1 || value === 2 || value === 3 ? value : null;

const keepBetter = (best: Record<string, LevelBest>, levelId: string, result: LevelBest) => {
  const previous = best[levelId];
  return previous === undefined || isBetter(result, previous)
    ? { ...best, [levelId]: result }
    : best;
};

export const mergeBest = (
  serverLevels: readonly ServerLevelBest[],
  pending: readonly Attempt[],
  knownLevelIds: ReadonlySet<string>,
): Record<string, LevelBest> => {
  const fromServer = serverLevels
    .filter(({ id }) => knownLevelIds.has(id))
    .reduce<Record<string, LevelBest>>(
      (best, { id, bestStars, bestMoves }) =>
        keepBetter(best, id, { stars: toStars(bestStars), moves: bestMoves }),
      {},
    );
  return pending
    .filter(
      ({ mode, ref, claimed }) =>
        mode === "campaign" && claimed.result === "won" && knownLevelIds.has(ref),
    )
    .reduce(
      (best, { ref, claimed }) =>
        keepBetter(best, ref, { stars: toStars(claimed.stars), moves: claimed.movesUsed }),
      fromServer,
    );
};
