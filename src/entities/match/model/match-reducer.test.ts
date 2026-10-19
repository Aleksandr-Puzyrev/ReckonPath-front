import type { ServerMessage } from "@shared/ws";

import { INITIAL_MATCH, receiveMatchMessage } from "./match-reducer";
import type { MatchState } from "./match-reducer";

const DEADLINE = "2026-10-19T12:00:05.300Z";

const OPPONENT = {
  id: "u2",
  nickname: "Kira",
  league: "GOLD",
  trophies: 2710,
  isBot: false,
  label: null,
};
const FORMAT = { size: 5, targets: 1, turnSec: 5, bombHint: true, maxTurns: 40 };

const run = (
  messages: ServerMessage[],
  from: MatchState = { ...INITIAL_MATCH, phase: "searching" },
) => messages.reduce(receiveMatchMessage, from);

const turn = (n: number, player: "me" | "opponent", extra: object = {}): ServerMessage => ({
  t: "match.turn",
  seq: n + 1,
  d: { turn: n, player, deadline: DEADLINE, ...extra },
});

const tapResult = (
  n: number,
  player: "me" | "opponent",
  outcome: "pelang" | "target" | "bomb",
): ServerMessage => ({
  t: "match.tapResult",
  seq: 10 + n,
  d: { turn: n, player, cell: [1, 2], outcome, value: outcome === "pelang" ? 3 : null },
});

const started = run([
  {
    t: "match.found",
    d: {
      matchId: "m1",
      endpoint: "wss://n/v1/match/m1",
      ticket: "t",
      opponent: OPPONENT,
      format: FORMAT,
    },
  },
  {
    t: "match.state",
    seq: 1,
    d: { state: "intro", opponentMap: {}, opponentBombs: 2, introEndsAt: DEADLINE },
  },
]);

describe("receiveMatchMessage", () => {
  test("follows the search with the waiting time and the async offer (ARN-06)", () => {
    const state = run([
      { t: "queue.status", d: { waitedSec: 12, range: 200, asyncAvailable: true } },
    ]);

    expect(state).toEqual(expect.objectContaining({ waitedSec: 12, isAsyncAvailable: true }));
  });

  test("goes searching → found → intro with the opponent and the format (Part 8 §6.3)", () => {
    expect(started).toEqual(
      expect.objectContaining({
        phase: "intro",
        opponent: OPPONENT,
        format: FORMAT,
        opponentBombs: 2,
      }),
    );
    expect(started.event?.kind).toBe("found");
  });

  test("starts my turn with the server deadline and remembers who went first", () => {
    const state = run([turn(1, "me")], started);

    expect(state).toEqual(
      expect.objectContaining({
        phase: "myTurn",
        current: "me",
        firstPlayer: "me",
        deadline: Date.parse(DEADLINE),
      }),
    );
    expect(state.event?.kind).toBe("myTurn");
  });

  test("records my tap result and passes the turn (PVP-01)", () => {
    const state = run([turn(1, "me"), tapResult(1, "me", "pelang"), turn(2, "opponent")], {
      ...started,
      pendingCell: [1, 2],
    });

    expect(state.myTaps).toEqual([
      { turn: 1, cell: [1, 2], outcome: "pelang", value: 3, bombNear: false },
    ]);
    expect(state).toEqual(expect.objectContaining({ phase: "opponentTurn", pendingCell: null }));
  });

  test("tells about my bomb and my skipped turn (PVP-03)", () => {
    const afterBomb = run([turn(1, "me"), tapResult(1, "me", "bomb")], started);
    expect(afterBomb.event?.kind).toBe("myBomb");

    const skipped = run(
      [turn(2, "opponent"), turn(3, "opponent", { skipped: [{ player: "me", reason: "bomb" }] })],
      afterBomb,
    );

    expect(skipped.event?.kind).toBe("mySkip");
  });

  test("lets me move again when the opponent hits my bomb", () => {
    const state = run(
      [
        turn(1, "opponent"),
        tapResult(1, "opponent", "bomb"),
        turn(2, "me"),
        turn(3, "me", { skipped: [{ player: "opponent", reason: "bomb" }] }),
      ],
      started,
    );

    expect(state.event?.kind).toBe("opponentSkips");
  });

  test("counts my timeouts in a row and resets them after a tap (PVP-05, PVP-07)", () => {
    const timeout = { skipped: [{ player: "me", reason: "timeout" }] };
    const twice = run(
      [turn(1, "me"), turn(2, "opponent", timeout), turn(3, "me"), turn(4, "opponent", timeout)],
      started,
    );
    expect(twice.event).toEqual(expect.objectContaining({ kind: "timeout", count: 2 }));

    const reset = run([turn(5, "me"), tapResult(5, "me", "pelang")], twice);

    expect(reset.myTimeouts).toBe(0);
  });

  test("marks the final turn for each side (PVP-09)", () => {
    expect(run([turn(4, "me", { final: true })], started)).toEqual(
      expect.objectContaining({
        phase: "finalTurn",
        event: expect.objectContaining({ kind: "finalForMe" }),
      }),
    );
    expect(run([turn(4, "opponent", { final: true })], started).event?.kind).toBe(
      "finalForOpponent",
    );
  });

  test("tells when the opponent finds my target", () => {
    const state = run([turn(1, "opponent"), tapResult(1, "opponent", "target")], started);

    expect(state.opponentTaps).toHaveLength(1);
    expect(state.event?.kind).toBe("opponentFound");
  });

  test("restores the whole match from a snapshot (NET-11)", () => {
    const state = run(
      [
        {
          t: "match.snapshot",
          seq: 9,
          d: {
            state: "playing",
            turn: 6,
            current: "opponent",
            deadline: DEADLINE,
            opponent: OPPONENT,
            format: FORMAT,
            opponentMap: {},
            opponentBombs: 2,
            myTaps: [{ turn: 1, player: "me", cell: [0, 0], outcome: "pelang", value: 4 }],
            opponentTaps: [],
            found: { me: 0, opponent: 1 },
            timeoutsRow: { me: 1 },
          },
        },
      ],
      INITIAL_MATCH,
    );

    expect(state).toEqual(
      expect.objectContaining({
        phase: "opponentTurn",
        turn: 6,
        found: { me: 0, opponent: 1 },
        myTimeouts: 1,
      }),
    );
    expect(state.myTaps).toHaveLength(1);
  });

  test("ends with the server result", () => {
    const end = {
      result: "win" as const,
      reason: "targets" as const,
      turns: { me: 5, opponent: 4 },
      maps: { mine: { targets: [], bombs: [] }, opponent: { targets: [], bombs: [] } },
      trophies: { before: 0, after: 30, delta: 30 },
      league: { changed: false },
      rp: 10,
      rewards: [],
    };

    expect(run([{ t: "match.end", seq: 20, d: end }], started)).toEqual(
      expect.objectContaining({ phase: "ended", end }),
    );
  });

  test("offers the running match when the search is refused with IN_MATCH (decision 0033 #4)", () => {
    const state = run([
      {
        t: "error",
        id: "j",
        d: { code: "IN_MATCH", details: { matchId: "m9", endpoint: "wss://n/m9" } },
      },
    ]);

    expect(state).toEqual(
      expect.objectContaining({
        phase: "idle",
        inMatch: { matchId: "m9", endpoint: "wss://n/m9" },
      }),
    );
  });

  test("stops the search on an invalid map (ARN-04)", () => {
    expect(run([{ t: "error", id: "j", d: { code: "MAP_INVALID" } }])).toEqual(
      expect.objectContaining({ phase: "idle", searchError: "MAP_INVALID" }),
    );
  });

  test("drops the pending tap when the server refuses it (PVP-02, PVP-08)", () => {
    const state = run([{ t: "error", id: "tap", d: { code: "STALE_TURN" } }], {
      ...started,
      pendingCell: [1, 1],
    });

    expect(state.pendingCell).toBeNull();
  });

  test("shows the opponent's emote and connection", () => {
    const state = run(
      [
        { t: "match.emote", d: { player: "opponent", emote: "wow" } },
        { t: "match.opponent", seq: 3, d: { connection: "reconnecting" } },
      ],
      started,
    );

    expect(state).toEqual(
      expect.objectContaining({
        emote: { player: "opponent", emote: "wow" },
        opponentConnection: "reconnecting",
      }),
    );
  });
});
