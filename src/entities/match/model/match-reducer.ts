import type { ServerMessage } from "@shared/ws";

type MessageOf<T extends ServerMessage["t"]> = Extract<ServerMessage, { t: T }>;

export type Side = "me" | "opponent";
export type Cell = [number, number];
export type MatchPhase =
  | "idle"
  | "searching"
  | "stopped"
  | "found"
  | "intro"
  | "myTurn"
  | "opponentTurn"
  | "finalTurn"
  | "ended"
  | "lost";
export type MatchOpponent = MessageOf<"match.found">["d"]["opponent"];
export type MatchFormat = MessageOf<"match.found">["d"]["format"];
export type MapLayout = MessageOf<"match.state">["d"]["opponentMap"];
export type MatchEnd = MessageOf<"match.end">["d"];
export type TurnSkip = NonNullable<MessageOf<"match.turn">["d"]["skipped"]>[number];
export type MatchEmote = MessageOf<"match.emote">["d"];
export type SearchError = "MAP_INVALID" | "BANNED" | "NETWORK";

export interface MatchTap {
  turn: number;
  cell: Cell;
  outcome: "pelang" | "target" | "bomb";
  value: number | null;
  bombNear: boolean;
}

export type MatchEventKind =
  | "found"
  | "myTurn"
  | "timeout"
  | "mySkip"
  | "opponentSkips"
  | "finalForMe"
  | "finalForOpponent"
  | "targetFound"
  | "myBomb"
  | "opponentFound"
  | "opponentBomb"
  | "emote";

export interface MatchEvent {
  id: number;
  kind: MatchEventKind;
  count: number;
}

export interface MatchState {
  phase: MatchPhase;
  waitedSec: number;
  isAsyncAvailable: boolean;
  searchError: SearchError | null;
  inMatch: { matchId: string; endpoint: string } | null;
  matchId: string | null;
  opponent: MatchOpponent | null;
  format: MatchFormat | null;
  layout: MapLayout | null;
  opponentBombs: number;
  turn: number;
  current: Side | null;
  firstPlayer: Side | null;
  deadline: number | null;
  skipped: TurnSkip[];
  myTaps: MatchTap[];
  opponentTaps: MatchTap[];
  found: Record<Side, number>;
  myTimeouts: number;
  pendingCell: Cell | null;
  opponentConnection: "online" | "reconnecting" | "offline";
  emote: MatchEmote | null;
  emoteId: number;
  end: MatchEnd | null;
  event: MatchEvent | null;
}

export const INITIAL_MATCH: MatchState = {
  phase: "idle",
  waitedSec: 0,
  isAsyncAvailable: false,
  searchError: null,
  inMatch: null,
  matchId: null,
  opponent: null,
  format: null,
  layout: null,
  opponentBombs: 0,
  turn: 0,
  current: null,
  firstPlayer: null,
  deadline: null,
  skipped: [],
  myTaps: [],
  opponentTaps: [],
  found: { me: 0, opponent: 0 },
  myTimeouts: 0,
  pendingCell: null,
  opponentConnection: "online",
  emote: null,
  emoteId: 0,
  end: null,
  event: null,
};

const SEARCH_ERRORS: ReadonlySet<string> = new Set(["MAP_INVALID", "BANNED"]);

const withEvent = (state: MatchState, kind: MatchEventKind, count = 0): MatchState => ({
  ...state,
  event: { id: (state.event?.id ?? 0) + 1, kind, count },
});

const cellOf = (cell: readonly number[]): Cell => [cell[0] ?? 0, cell[1] ?? 0];

const tapOf = (tap: {
  turn: number;
  cell: readonly number[];
  outcome: MatchTap["outcome"];
  value?: number | null;
  bombNear?: boolean;
}): MatchTap => ({
  turn: tap.turn,
  cell: cellOf(tap.cell),
  outcome: tap.outcome,
  value: tap.value ?? null,
  bombNear: tap.bombNear ?? false,
});

const turnPhase = (player: Side, isFinal: boolean): MatchPhase => {
  if (isFinal) return "finalTurn";
  return player === "me" ? "myTurn" : "opponentTurn";
};

const turnEvent = (player: Side, isFinal: boolean, skipped: readonly TurnSkip[]) => {
  if (isFinal) return player === "me" ? "finalForMe" : "finalForOpponent";
  if (skipped.some((skip) => skip.player === "opponent" && skip.reason === "bomb")) {
    return "opponentSkips";
  }
  if (skipped.some((skip) => skip.player === "me" && skip.reason === "bomb")) return "mySkip";
  return player === "me" ? "myTurn" : null;
};

const receiveTurn = (state: MatchState, { d }: MessageOf<"match.turn">): MatchState => {
  const skipped = d.skipped ?? [];
  const isFinal = d.final === true;
  const hasTimedOut = skipped.some((skip) => skip.player === "me" && skip.reason === "timeout");
  const next: MatchState = {
    ...state,
    phase: turnPhase(d.player, isFinal),
    turn: d.turn,
    current: d.player,
    firstPlayer: state.firstPlayer ?? d.player,
    deadline: Date.parse(d.deadline),
    skipped,
    myTimeouts: hasTimedOut ? state.myTimeouts + 1 : state.myTimeouts,
    pendingCell: null,
  };
  if (hasTimedOut) return withEvent(next, "timeout", next.myTimeouts);
  const kind = turnEvent(d.player, isFinal, skipped);
  return kind === null ? next : withEvent(next, kind);
};

const TAP_EVENTS = {
  me: { target: "targetFound", bomb: "myBomb", pelang: null },
  opponent: { target: "opponentFound", bomb: "opponentBomb", pelang: null },
} as const;

const receiveTapResult = (state: MatchState, { d }: MessageOf<"match.tapResult">) => {
  const tap = tapOf(d);
  const next: MatchState = {
    ...state,
    myTaps: d.player === "me" ? [...state.myTaps, tap] : state.myTaps,
    opponentTaps: d.player === "opponent" ? [...state.opponentTaps, tap] : state.opponentTaps,
    found: d.found ?? state.found,
    myTimeouts: d.player === "me" ? 0 : state.myTimeouts,
    pendingCell: d.player === "me" ? null : state.pendingCell,
  };
  const kind = TAP_EVENTS[d.player][d.outcome];
  return kind === null ? next : withEvent(next, kind);
};

const receiveSnapshot = (state: MatchState, { d }: MessageOf<"match.snapshot">): MatchState => ({
  ...state,
  phase: d.state === "intro" ? "intro" : turnPhase(d.current, d.final === true),
  opponent: d.opponent,
  format: d.format,
  layout: d.opponentMap,
  opponentBombs: d.opponentBombs,
  turn: d.turn,
  current: d.current,
  deadline: Date.parse(d.deadline),
  myTaps: d.myTaps.map(tapOf),
  opponentTaps: d.opponentTaps.map(tapOf),
  found: d.found,
  myTimeouts: d.timeoutsRow?.me ?? 0,
  pendingCell: null,
});

const receiveError = (state: MatchState, { d }: MessageOf<"error">): MatchState => {
  if (
    d.code === "IN_MATCH" &&
    d.details?.matchId !== undefined &&
    d.details.endpoint !== undefined
  ) {
    return {
      ...state,
      phase: "idle",
      inMatch: { matchId: d.details.matchId, endpoint: d.details.endpoint },
    };
  }
  if (SEARCH_ERRORS.has(d.code) && state.phase === "searching") {
    return { ...state, phase: "idle", searchError: d.code === "BANNED" ? "BANNED" : "MAP_INVALID" };
  }
  return { ...state, pendingCell: null };
};

export const receiveMatchMessage = (state: MatchState, message: ServerMessage): MatchState => {
  switch (message.t) {
    case "queue.status":
      return {
        ...state,
        waitedSec: message.d.waitedSec,
        isAsyncAvailable: message.d.asyncAvailable,
      };
    case "match.found":
      return withEvent(
        {
          ...state,
          phase: "found",
          matchId: message.d.matchId,
          opponent: message.d.opponent,
          format: message.d.format,
        },
        "found",
      );
    case "match.state":
      return {
        ...state,
        phase: "intro",
        layout: message.d.opponentMap,
        opponentBombs: message.d.opponentBombs,
      };
    case "match.turn":
      return receiveTurn(state, message);
    case "match.tapResult":
      return receiveTapResult(state, message);
    case "match.opponent":
      return { ...state, opponentConnection: message.d.connection };
    case "match.emote":
      return withEvent({ ...state, emote: message.d, emoteId: state.emoteId + 1 }, "emote");
    case "match.snapshot":
      return receiveSnapshot(state, message);
    case "match.end":
      return { ...state, phase: "ended", end: message.d, pendingCell: null };
    case "error":
      return receiveError(state, message);
    default:
      return state;
  }
};
