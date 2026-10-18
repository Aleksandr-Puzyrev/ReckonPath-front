import type { MatchSnapshotServerMessage } from "../../../ws/generated/messages";
import type { components } from "../../generated/schema";

import type { MatchSetup, RoomTap } from "./match-end";
import type { createMatchRules, Side } from "./match-rules";

type PvpMap = components["schemas"]["PvpMap"];

interface SnapshotInput {
  setup: MatchSetup;
  rules: ReturnType<typeof createMatchRules>;
  taps: readonly RoomTap[];
  seq: number;
  turn: number;
  current: Side;
  deadline: number;
  isFinal: boolean;
  hasStarted: boolean;
}

export const layoutOf = ({ fences, streams, bridges, heavy, rocks }: PvpMap) => ({
  fences,
  streams,
  bridges,
  heavy,
  rocks,
});

const tapsOf = (taps: readonly RoomTap[], side: Side) =>
  taps
    .filter(({ player }) => player === side)
    .map(({ outcome, value, bombNear, ...tap }) => ({
      ...tap,
      outcome,
      ...(outcome === "bomb" ? {} : { value, bombNear }),
    }));

export const snapshotOf = ({
  setup,
  rules,
  taps,
  seq,
  turn,
  current,
  deadline,
  isFinal,
  hasStarted,
}: SnapshotInput): MatchSnapshotServerMessage => ({
  t: "match.snapshot",
  seq,
  d: {
    state: hasStarted ? rules.state() : "intro",
    turn,
    current,
    deadline: new Date(deadline).toISOString(),
    final: isFinal,
    opponent: setup.opponent,
    format: setup.format,
    opponentMap: layoutOf(setup.opponentMap),
    opponentBombs: setup.opponentMap.bombs?.length ?? 0,
    myTaps: tapsOf(taps, "me"),
    opponentTaps: tapsOf(taps, "opponent"),
    found: rules.found(),
    timeoutsRow: rules.timeoutsRow(),
    skip: rules.skip(),
  },
});
