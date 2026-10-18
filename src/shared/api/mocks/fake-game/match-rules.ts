export type Side = "me" | "opponent";
export type TurnOutcome = "pelang" | "target" | "bomb" | "timeout";

export interface Ending {
  winner: Side | null;
  reason: "targets" | "afk" | "turnLimit";
}

export type TurnStep =
  | { kind: "turn"; player: Side; skipped: Side[]; isFinal: boolean }
  | { kind: "end"; ending: Ending };

const AFK_TIMEOUTS = 3;

export const otherSide = (side: Side): Side => (side === "me" ? "opponent" : "me");

const perSide = () => ({ me: 0, opponent: 0 });

// A port of the engine's test-only simulate-match (Part 6 §4.2) — the server's endTurn (перенос тестового simulate-match движка — серверный endTurn).
export const createMatchRules = (targets: number, maxTurns: number) => {
  const turnsUsed = perSide();
  const skip = perSide();
  const timeoutsRow = perSide();
  const found = perSide();
  let state: "playing" | "finalTurn" = "playing";

  const isTurnLimitReached = () => turnsUsed.me >= maxTurns && turnsUsed.opponent >= maxTurns;
  const turnLimitEnd = (): TurnStep => {
    const winner =
      found.me === found.opponent ? null : found.me > found.opponent ? "me" : "opponent";
    return { kind: "end", ending: { winner, reason: "turnLimit" } };
  };

  const endTurn = (player: Side, outcome: TurnOutcome): TurnStep => {
    if (outcome === "target") found[player] += 1;
    turnsUsed[player] += 1;
    if (outcome === "timeout") {
      timeoutsRow[player] += 1;
      if (timeoutsRow[player] === AFK_TIMEOUTS) {
        return { kind: "end", ending: { winner: otherSide(player), reason: "afk" } };
      }
    } else {
      timeoutsRow[player] = 0;
    }
    if (outcome === "bomb") skip[player] += 1;

    if (state === "finalTurn") {
      const winner = found[player] === targets ? null : otherSide(player);
      return { kind: "end", ending: { winner, reason: "targets" } };
    }

    if (found[player] === targets) {
      const opponent = otherSide(player);
      while (turnsUsed[opponent] < turnsUsed[player]) {
        if (skip[opponent] === 0) {
          state = "finalTurn";
          return { kind: "turn", player: opponent, skipped: [], isFinal: true };
        }
        skip[opponent] -= 1;
        turnsUsed[opponent] += 1;
      }
      return { kind: "end", ending: { winner: player, reason: "targets" } };
    }

    if (isTurnLimitReached()) return turnLimitEnd();

    const skipped: Side[] = [];
    let next = otherSide(player);
    while (skip[next] > 0) {
      skip[next] -= 1;
      turnsUsed[next] += 1;
      skipped.push(next);
      next = otherSide(next);
    }
    if (isTurnLimitReached()) return turnLimitEnd();
    return { kind: "turn", player: next, skipped, isFinal: false };
  };

  return {
    endTurn,
    state: () => state,
    turnsUsed: () => ({ ...turnsUsed }),
    found: () => ({ ...found }),
    skip: () => ({ ...skip }),
    timeoutsRow: () => ({ ...timeoutsRow }),
  };
};
