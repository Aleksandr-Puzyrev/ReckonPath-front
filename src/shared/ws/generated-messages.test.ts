import { clientMessageSchema, serverMessageSchema } from "@shared/ws";

const CLIENT_MESSAGES = [
  { t: "queue.join", id: "c1", d: { format: 7, mapId: "map_1" } },
  { t: "queue.leave", id: "c2" },
  { t: "match.tap", id: "c5", d: { turn: 7, cell: [4, 2] } },
  { t: "match.emote", d: { emote: "nice" } },
  { t: "match.surrender", id: "c6" },
  { t: "match.resync", id: "c7" },
  { t: "ping", d: { c: 1727352000123 } },
];

const SERVER_MESSAGES = [
  { t: "ack", id: "c1" },
  { t: "queue.status", d: { waitedSec: 7, range: 150, asyncAvailable: false } },
  {
    t: "match.found",
    d: {
      matchId: "m1",
      endpoint: "wss://game-3.example/v1/match/m1",
      ticket: "ticket",
      opponent: {
        id: "u2",
        nickname: "Kira",
        league: "GOLD",
        division: 1,
        trophies: 2710,
        isBot: false,
        label: null,
      },
      format: { size: 7, targets: 2, turnSec: 7, bombHint: true, maxTurns: 40 },
    },
  },
  {
    t: "match.turn",
    seq: 10,
    d: {
      turn: 4,
      player: "me",
      deadline: "2026-09-26T12:00:08.000Z",
      skipped: [{ player: "opponent", reason: "bomb" }],
    },
  },
  {
    t: "match.tapResult",
    seq: 3,
    d: {
      turn: 1,
      player: "me",
      cell: [4, 2],
      outcome: "pelang",
      value: 3,
      bombNear: false,
      found: { me: 0, opponent: 0 },
    },
  },
  {
    t: "match.tapResult",
    seq: 9,
    d: { turn: 3, player: "opponent", cell: [2, 5], outcome: "bomb" },
  },
  { t: "match.opponent", seq: 16, d: { connection: "reconnecting" } },
  { t: "error", id: "c5", d: { code: "NOT_YOUR_TURN" } },
  { t: "pong", d: { c: 1727352000123, s: 1727352000180 } },
];

describe("WebSocket message schemas", () => {
  test.each(CLIENT_MESSAGES)("accepts the client message $t of Part 7 §8.2", (message) => {
    expect(clientMessageSchema.safeParse(message).success).toBe(true);
  });

  test.each(SERVER_MESSAGES)("accepts the server message $t of Part 7 §8.2", (message) => {
    expect(serverMessageSchema.safeParse(message).success).toBe(true);
  });

  test("rejects a tap outside the board", () => {
    const message = { t: "match.tap", id: "c5", d: { turn: 7, cell: [9, 2] } };

    expect(clientMessageSchema.safeParse(message).success).toBe(false);
  });
});
