import { toCell } from "@reckon-path/engine";
import type { Rng } from "@reckon-path/engine";

import type { ClientMessage, ServerMessage } from "../../../ws/generated/messages";
import { mockTrophies } from "../mock-arena-profile";

import { createFakeBot } from "./fake-bot";
import { createMatchBoard, tapBoard } from "./match-board";
import type { BoardTap } from "./match-board";
import { recordMatchEnd } from "./match-end";
import type { MatchSetup, RoomTap } from "./match-end";
import { createMatchRules, otherSide } from "./match-rules";
import type { Ending, Side, TurnStep } from "./match-rules";
import { layoutOf, snapshotOf } from "./match-snapshot";

export const INTRO_MS = 3000;
export const NETWORK_ALLOWANCE_MS = 300;
const EMOTE_COOLDOWN_MS = 5000;
const MS_PER_SECOND = 1000;

type Sink = (message: ServerMessage) => void;
type Sequenced = Extract<
  ServerMessage,
  { t: "match.state" | "match.turn" | "match.tapResult" | "match.end" }
>;
type TapMessage = Extract<ClientMessage, { t: "match.tap" }>;
type ErrorCode = Extract<ServerMessage, { t: "error" }>["d"]["code"];

export type MatchRoom = ReturnType<typeof createMatchRoom>;

export const createMatchRoom = (setup: MatchSetup, rng: Rng, first: Side | null) => {
  const { format, myMap, opponentMap } = setup;
  const rules = createMatchRules(format.targets, format.maxTurns);
  const boards: Record<Side, ReturnType<typeof createMatchBoard>> = {
    me: createMatchBoard(opponentMap, format.bombHint),
    opponent: createMatchBoard(myMap, format.bombHint),
  };
  const bot = createFakeBot(boards.opponent, mockTrophies(), rng);
  const taps: RoomTap[] = [];
  let sink: Sink | null = null;
  let seq = 0;
  let turn = 0;
  const coin: Side = rng() < 0.5 ? "me" : "opponent";
  let current: Side = first ?? coin;
  let deadline = Date.now() + INTRO_MS;
  let isFinal = false;
  let hasIntro = false;
  let hasStarted = false;
  let isOver = false;
  let lastEmoteAt = Number.NEGATIVE_INFINITY;
  let timers: ReturnType<typeof setTimeout>[] = [];

  const push = (message: ServerMessage) => sink?.(message);
  const pushSequenced = (message: Sequenced) => {
    seq += 1;
    push({ ...message, seq });
  };
  const later = (ms: number, run: () => void) => {
    timers = [...timers, setTimeout(run, ms)];
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const finish = (ending: Ending | { winner: Side; reason: "surrender" }) => {
    isOver = true;
    clearTimers();
    pushSequenced({ t: "match.end", d: recordMatchEnd(setup, rules, taps, ending) });
  };

  const tap = (side: Side, result: BoardTap) => {
    boards[side] = result.game;
    if (side === "opponent") bot.observe(result);
    const { outcome, value, bombNear, idx } = result;
    const [row, col] = toCell(result.game.board.cols, idx);
    const cell: [number, number] = [row, col];
    taps.push({ turn, player: side, cell, outcome, value, bombNear });
    const step = rules.endTurn(side, outcome);
    pushSequenced({
      t: "match.tapResult",
      d: {
        turn,
        player: side,
        cell,
        outcome,
        ...(outcome === "bomb" ? {} : { value, bombNear }),
        found: rules.found(),
      },
    });
    advance(step);
  };

  const playBot = () => {
    const thinkMs = bot.thinkMs();
    if (thinkMs === null) return;
    const turnOfMove = turn;
    later(thinkMs, () => {
      if (isOver || turn !== turnOfMove) return;
      const result = tapBoard(boards.opponent, bot.chooseCell());
      if (typeof result !== "string") tap("opponent", result);
    });
  };

  const startTurn = (player: Side, skipped: { player: Side; reason: "bomb" | "timeout" }[]) => {
    turn += 1;
    current = player;
    deadline = Date.now() + format.turnSec * MS_PER_SECOND + NETWORK_ALLOWANCE_MS;
    pushSequenced({
      t: "match.turn",
      d: {
        turn,
        player,
        deadline: new Date(deadline).toISOString(),
        ...(skipped.length > 0 ? { skipped } : {}),
        ...(isFinal ? { final: true } : {}),
      },
    });
    const turnOfTimer = turn;
    later(deadline - Date.now(), () => {
      if (!isOver && turn === turnOfTimer) timeOut(player);
    });
    if (player === "opponent") playBot();
  };

  const advance = (step: TurnStep, timedOut?: Side) => {
    if (step.kind === "end") {
      finish(step.ending);
      return;
    }
    isFinal = step.isFinal;
    const skipped = [
      ...(timedOut === undefined ? [] : [{ player: timedOut, reason: "timeout" as const }]),
      ...step.skipped.map((player) => ({ player, reason: "bomb" as const })),
    ];
    startTurn(step.player, skipped);
  };

  const timeOut = (player: Side) => advance(rules.endTurn(player, "timeout"), player);

  const refusalOf = (d: TapMessage["d"]): ErrorCode | BoardTap | null => {
    if (isOver) return "MATCH_OVER";
    if (d.turn !== turn) return "STALE_TURN";
    if (current !== "me" || !hasStarted) return "NOT_YOUR_TURN";
    const [row = -1, col = -1] = d.cell;
    const result = tapBoard(boards.me, [row, col]);
    return result === "OUTSIDE" ? null : result;
  };

  const handleTap = ({ id, d }: TapMessage) => {
    const result = refusalOf(d);
    if (result === null) return;
    if (typeof result === "string") {
      push({ t: "error", id, d: { code: result } });
      return;
    }
    push({ t: "ack", id });
    tap("me", result);
  };

  const handleEmote = (emote: Extract<ClientMessage, { t: "match.emote" }>["d"]["emote"]) => {
    if (Date.now() - lastEmoteAt < EMOTE_COOLDOWN_MS) return;
    lastEmoteAt = Date.now();
    push({ t: "match.emote", d: { player: "me", emote } });
  };

  const surrender = (id: string | undefined) => {
    if (isOver) {
      push({ t: "error", id, d: { code: "MATCH_OVER" } });
      return;
    }
    push({ t: "ack", id });
    finish({ winner: otherSide("me"), reason: "surrender" });
  };

  const sendSnapshot = () => {
    seq += 1;
    push(snapshotOf({ setup, rules, taps, seq, turn, current, deadline, isFinal, hasStarted }));
  };

  return {
    attach: (next: Sink) => {
      sink = next;
    },
    detach: (current: Sink) => {
      if (sink === current) sink = null;
    },
    dispose: () => {
      clearTimers();
      sink = null;
    },
    start: () => {
      if (hasIntro || isOver) return;
      hasIntro = true;
      deadline = Date.now() + INTRO_MS;
      pushSequenced({
        t: "match.state",
        d: {
          state: "intro",
          opponentMap: layoutOf(opponentMap),
          opponentBombs: opponentMap.bombs?.length ?? 0,
          introEndsAt: new Date(deadline).toISOString(),
        },
      });
      later(INTRO_MS, () => {
        hasStarted = true;
        startTurn(current, []);
      });
    },
    sendSnapshot,
    handle: (message: ClientMessage) => {
      if (message.t === "match.tap") handleTap(message);
      if (message.t === "match.emote") handleEmote(message.d.emote);
      if (message.t === "match.resync") sendSnapshot();
      if (message.t === "match.surrender") surrender(message.id);
    },
    isOver: () => isOver,
    matchId: setup.matchId,
  };
};
