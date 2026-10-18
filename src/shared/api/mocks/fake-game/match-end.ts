import type {
  MatchFoundServerMessage,
  MatchEndServerMessage,
} from "../../../ws/generated/messages";
import type { components } from "../../generated/schema";
import { recordMockMatch } from "../mock-arena-profile";

import type { TapOutcome } from "./match-board";
import type { createMatchRules, Ending, Side } from "./match-rules";

type PvpMap = components["schemas"]["PvpMap"];

export interface MatchSetup {
  matchId: string;
  format: MatchFoundServerMessage["d"]["format"];
  opponent: MatchFoundServerMessage["d"]["opponent"];
  myMap: PvpMap;
  opponentMap: PvpMap;
}

export interface RoomTap {
  turn: number;
  player: Side;
  cell: [number, number];
  outcome: TapOutcome;
  value: number | null;
  bombNear: boolean;
}

type MatchEnding = Ending | { winner: Side; reason: "surrender" };

const outcomeOf = ({ winner }: MatchEnding) => {
  if (winner === null) return "draw" as const;
  return winner === "me" ? ("win" as const) : ("loss" as const);
};

const hiddenOf = ({ targets, bombs }: PvpMap) => ({ targets, bombs: bombs ?? [] });

export const recordMatchEnd = (
  { matchId, opponent, myMap, opponentMap }: MatchSetup,
  rules: ReturnType<typeof createMatchRules>,
  taps: readonly RoomTap[],
  ending: MatchEnding,
): MatchEndServerMessage["d"] => {
  const result = outcomeOf(ending);
  const turns = rules.turnsUsed();
  const extras = recordMockMatch({
    outcome: result,
    kind: opponent.isBot ? "bot" : "ranked",
    opponentTrophies: opponent.trophies,
    details: {
      matchId,
      mode: opponent.isBot ? "bot" : "ranked",
      opponent: {
        id: opponent.id,
        nickname: opponent.nickname,
        league: opponent.league,
        isBot: opponent.isBot,
        label: opponent.label ?? null,
      },
      result,
      reason: ending.reason,
      turns,
      endedAt: new Date().toISOString(),
      maps: { mine: myMap, opponent: opponentMap },
      taps: taps.map(({ turn, player, cell, outcome, value }) => ({
        turn,
        player,
        cell,
        outcome,
        value,
      })),
    },
  });
  return {
    result,
    reason: ending.reason,
    turns,
    maps: { mine: hiddenOf(myMap), opponent: hiddenOf(opponentMap) },
    ...extras,
  };
};
