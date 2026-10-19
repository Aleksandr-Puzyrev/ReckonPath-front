import { applyTrophies, trophyDelta } from "@reckon-path/engine";

import type { MatchOpponent } from "@entities/match";

export const surrenderLoss = (myTrophies: number, opponent: MatchOpponent) => {
  const delta = trophyDelta({
    myTrophies,
    opponentTrophies: opponent.trophies,
    outcome: "loss",
    kind: opponent.isBot ? "bot" : "ranked",
  });
  return myTrophies - applyTrophies(myTrophies, delta, 0);
};
