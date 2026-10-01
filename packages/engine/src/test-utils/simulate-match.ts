import { z } from "zod";

const AFK_TIMEOUTS = 3;

const playerSchema = z.enum(["A", "B"]);
const perPlayer = z.object({ A: z.number().int().min(0), B: z.number().int().min(0) }).strict();

export const matchVectorSchema = z
  .object({
    kind: z.literal("match"),
    name: z.string(),
    note: z.string(),
    targets: z.number().int().min(1),
    maxTurns: z.number().int().min(1),
    first: playerSchema,
    turns: z.array(
      z.union([
        z
          .object({
            player: playerSchema,
            outcome: z.enum(["normal", "target", "bomb", "timeout"]),
          })
          .strict(),
        z.object({ surrender: playerSchema }).strict(),
      ]),
    ),
    expect: z.discriminatedUnion("state", [
      z
        .object({
          state: z.enum(["playing", "finalTurn"]),
          current: playerSchema,
          turnsUsed: perPlayer,
          found: perPlayer,
          skip: perPlayer,
          timeoutsRow: perPlayer,
        })
        .strict(),
      z
        .object({
          state: z.literal("ended"),
          winner: playerSchema.nullable(),
          reason: z.enum(["targets", "afk", "turnLimit", "surrender"]),
          turnsUsed: perPlayer,
          found: perPlayer,
        })
        .strict(),
    ]),
  })
  .strict();

type MatchVector = z.infer<typeof matchVectorSchema>;
type Player = z.infer<typeof playerSchema>;
type Turn = MatchVector["turns"][number];
type Outcome = Extract<Turn, { outcome: unknown }>["outcome"];
type Ending = Pick<Extract<MatchVector["expect"], { state: "ended" }>, "winner" | "reason">;

const other = (player: Player): Player => (player === "A" ? "B" : "A");

export const simulateMatch = ({ targets, maxTurns, first, turns }: MatchVector) => {
  const turnsUsed = { A: 0, B: 0 };
  const skip = { A: 0, B: 0 };
  const timeoutsRow = { A: 0, B: 0 };
  const found = { A: 0, B: 0 };
  let state: "playing" | "finalTurn" = "playing";
  let current = first;
  let ended: Ending | null = null;

  const isTurnLimitReached = () => turnsUsed.A >= maxTurns && turnsUsed.B >= maxTurns;
  const turnLimitEnding = (): Ending => {
    const winner = found.A === found.B ? null : found.A > found.B ? "A" : "B";
    return { winner, reason: "turnLimit" };
  };

  const endTurn = (player: Player, outcome: Outcome): Ending | null => {
    if (outcome === "target") found[player] += 1;
    turnsUsed[player] += 1;
    if (outcome === "timeout") {
      timeoutsRow[player] += 1;
      if (timeoutsRow[player] === AFK_TIMEOUTS) return { winner: other(player), reason: "afk" };
    } else {
      timeoutsRow[player] = 0;
    }
    if (outcome === "bomb") skip[player] += 1;

    if (state === "finalTurn") {
      return { winner: found[player] === targets ? null : other(player), reason: "targets" };
    }

    if (found[player] === targets) {
      const opponent = other(player);
      while (turnsUsed[opponent] < turnsUsed[player]) {
        if (skip[opponent] === 0) {
          state = "finalTurn";
          current = opponent;
          return null;
        }
        skip[opponent] -= 1;
        turnsUsed[opponent] += 1;
      }
      return { winner: player, reason: "targets" };
    }

    if (isTurnLimitReached()) return turnLimitEnding();

    let next = other(player);
    while (skip[next] > 0) {
      skip[next] -= 1;
      turnsUsed[next] += 1;
      next = other(next);
    }
    // Skipped turns count, so the limit is checked again: no turn past the limit (пропуски считаются ходами, лимит проверяется снова: хода сверх лимита нет).
    if (isTurnLimitReached()) return turnLimitEnding();
    current = next;
    return null;
  };

  for (const turn of turns) {
    if (ended !== null) throw new Error("A turn after the match ended");
    if ("surrender" in turn) {
      ended = { winner: other(turn.surrender), reason: "surrender" };
      continue;
    }
    if (turn.player !== current) throw new Error(`${turn.player} moved on ${current}'s turn`);
    ended = endTurn(turn.player, turn.outcome);
  }

  if (ended === null) return { state, current, turnsUsed, found, skip, timeoutsRow };
  return { state: "ended", ...ended, turnsUsed, found };
};
