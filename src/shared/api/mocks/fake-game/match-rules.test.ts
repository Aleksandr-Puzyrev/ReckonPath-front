import vectors from "../../../../../packages/engine/vectors/match.json";

import { createMatchRules } from "./match-rules";
import type { Side, TurnStep } from "./match-rules";

const SIDES = { A: "me", B: "opponent" } as const satisfies Record<string, Side>;
const PLAYERS = { me: "A", opponent: "B" } as const;
const OUTCOMES = { normal: "pelang", target: "target", bomb: "bomb", timeout: "timeout" } as const;

const perPlayer = ({ me, opponent }: { me: number; opponent: number }) => ({ A: me, B: opponent });

type Vector = (typeof vectors)[number];

const replay = ({ targets, maxTurns, first, turns }: Vector) => {
  const rules = createMatchRules(targets, maxTurns);
  let current: Side = SIDES[first as keyof typeof SIDES];
  let step: TurnStep | { kind: "surrender"; winner: Side } | null = null;
  for (const turn of turns) {
    if ("surrender" in turn) {
      step = { kind: "surrender", winner: turn.surrender === "A" ? "opponent" : "me" };
      continue;
    }
    expect(SIDES[turn.player as keyof typeof SIDES]).toBe(current);
    step = rules.endTurn(current, OUTCOMES[turn.outcome as keyof typeof OUTCOMES]);
    if (step.kind === "turn") current = step.player;
  }
  return { rules, current, step };
};

describe("createMatchRules", () => {
  test.each(vectors.map((vector) => [vector.name, vector] as const))(
    "replays the engine match vector %s",
    (_name, vector) => {
      const { rules, current, step } = replay(vector);
      const { expect: expected } = vector;

      expect(perPlayer(rules.turnsUsed())).toEqual(expected.turnsUsed);
      expect(perPlayer(rules.found())).toEqual(expected.found);
      if (expected.state === "ended") {
        const ending =
          step?.kind === "surrender"
            ? { winner: step.winner, reason: "surrender" }
            : step?.kind === "end"
              ? step.ending
              : null;
        expect(ending?.reason).toBe(expected.reason);
        expect(ending?.winner === null ? null : PLAYERS[ending?.winner ?? "me"]).toBe(
          expected.winner,
        );
        return;
      }
      expect(rules.state()).toBe(expected.state);
      expect(PLAYERS[current]).toBe(expected.current);
      expect(perPlayer(rules.skip())).toEqual(expected.skip);
      expect(perPlayer(rules.timeoutsRow())).toEqual(expected.timeoutsRow);
    },
  );
});
