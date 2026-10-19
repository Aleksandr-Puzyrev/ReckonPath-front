import { rngFromKey } from "@reckon-path/engine";
import type { Rng } from "@reckon-path/engine";

import { clientMessageSchema } from "../../../ws/generated/messages";
import type { ClientMessage, ServerMessage } from "../../../ws/generated/messages";
import { mockArenaMap } from "../arena-map-handlers";
import { ARENA_FORMAT } from "../mock-arena-format";
import { mockDivision, mockLeague, mockTrophies } from "../mock-arena-profile";
import { randomMockMap } from "../mock-map-check";
import type { components } from "../../generated/schema";

import { BOT_NICKNAMES, PLAYER_NICKNAMES } from "./fake-nicknames";
import { createMatchRoom } from "./match-room";
import type { Side } from "./match-rules";
import type { MatchRoom } from "./match-room";

type PvpMap = components["schemas"]["PvpMap"];

export const FAKE_WS_ORIGIN = "wss://game.mock.reckon-path.local";
const MATCH_ENDPOINT = "wss://game-1.mock.reckon-path.local/v1/match/";
const MAX_TURNS = 40;
const STATUS_INTERVAL_MS = 1000;
const FOUND_MIN_MS = 3000;
const FOUND_RANGE_MS = 5000;
const BOT_AFTER_MS = 20_000;
const ASYNC_AFTER_SEC = 10;
const RANGE_START = 100;
const RANGE_STEP = 50;
const RANGE_STEP_SEC = 5;
const RANGE_MAX = 400;
const MS_PER_SECOND = 1000;

export interface FakePeer {
  deliver: (message: ServerMessage) => void;
  close: (code: number, reason: string) => void;
}

interface Queue {
  peer: FakePeer;
  mapId: string;
  joinedAt: number;
  timers: ReturnType<typeof setTimeout>[];
}

export interface FakeGameOptions {
  hasOpponent: boolean;
  opponentMap: PvpMap | null;
  first: Side | null;
}

const DEFAULT_OPTIONS: FakeGameOptions = { hasOpponent: true, opponentMap: null, first: null };

let options = DEFAULT_OPTIONS;
let matchCount = 0;
let queue: Queue | null = null;
let room: MatchRoom | null = null;
let peers = new Set<FakePeer>();

const waitedSec = (joinedAt: number) => Math.floor((Date.now() - joinedAt) / MS_PER_SECOND);

const rangeOf = (waited: number) =>
  Math.min(RANGE_MAX, RANGE_START + RANGE_STEP * Math.floor(waited / RANGE_STEP_SEC));

const pick = <T>(rng: Rng, items: readonly T[]) => items[Math.floor(rng() * items.length)];

const stopQueue = () => {
  queue?.timers.forEach(clearTimeout);
  queue = null;
};

const opponentOf = (rng: Rng, isBot: boolean, range: number) => {
  const mine = mockTrophies();
  const trophies = isBot ? mine : Math.max(0, mine + Math.round((rng() * 2 - 1) * range));
  return {
    id: `${isBot ? "bot" : "player"}_${matchCount}`,
    nickname: pick(rng, isBot ? BOT_NICKNAMES : PLAYER_NICKNAMES) ?? "",
    league: mockLeague(trophies),
    division: mockDivision(trophies),
    trophies,
    isBot,
    label: isBot ? "training" : null,
  };
};

const findMatch = (current: Queue, isBot: boolean) => {
  const myMap = mockArenaMap(current.mapId);
  const { size, targets, turnSec, bombHint } = ARENA_FORMAT;
  const opponentMap = options.opponentMap ?? randomMockMap(ARENA_FORMAT)?.map;
  stopQueue();
  if (myMap === undefined || opponentMap === undefined) return;
  matchCount += 1;
  const rng = rngFromKey(`fake-match-${matchCount}`);
  const matchId = `match_${matchCount}`;
  const setup = {
    matchId,
    format: { size, targets, turnSec, bombHint, maxTurns: MAX_TURNS },
    opponent: opponentOf(rng, isBot, rangeOf(waitedSec(current.joinedAt))),
    myMap: myMap.map,
    opponentMap,
  };
  room?.dispose();
  room = createMatchRoom(setup, rng, options.first);
  current.peer.deliver({
    t: "match.found",
    d: {
      matchId,
      endpoint: `${MATCH_ENDPOINT}${matchId}`,
      ticket: `ticket_${matchCount}`,
      opponent: setup.opponent,
      format: setup.format,
    },
  });
};

const sendStatus = (current: Queue) => {
  const waited = waitedSec(current.joinedAt);
  current.peer.deliver({
    t: "queue.status",
    d: { waitedSec: waited, range: rangeOf(waited), asyncAvailable: waited >= ASYNC_AFTER_SEC },
  });
};

const refusalOf = (mapId: string) => {
  if (room !== null && !room.isOver()) return "IN_MATCH";
  if (queue !== null) return "ALREADY_QUEUED";
  const map = mockArenaMap(mapId);
  return map?.valid === true && map.format === ARENA_FORMAT.size ? null : "MAP_INVALID";
};

const joinQueue = (peer: FakePeer, id: string | undefined, mapId: string) => {
  const refusal = refusalOf(mapId);
  if (refusal !== null) {
    const details =
      refusal === "IN_MATCH" && room !== null
        ? { details: { matchId: room.matchId, endpoint: `${MATCH_ENDPOINT}${room.matchId}` } }
        : {};
    peer.deliver({ t: "error", id, d: { code: refusal, ...details } });
    return;
  }
  peer.deliver({ t: "ack", id });
  const current: Queue = { peer, mapId, joinedAt: Date.now(), timers: [] };
  queue = current;
  const rng = rngFromKey(`fake-queue-${matchCount}`);
  const foundAfter = options.hasOpponent ? FOUND_MIN_MS + rng() * FOUND_RANGE_MS : BOT_AFTER_MS;
  const ticks = Math.floor(foundAfter / STATUS_INTERVAL_MS);
  current.timers = [
    ...Array.from({ length: ticks }, (_, tick) =>
      setTimeout(() => sendStatus(current), (tick + 1) * STATUS_INTERVAL_MS),
    ),
    setTimeout(() => findMatch(current, !options.hasOpponent), foundAfter),
  ];
  sendStatus(current);
};

const pong = (peer: FakePeer, c: number) => peer.deliver({ t: "pong", d: { c, s: Date.now() } });

const handleEntry = (peer: FakePeer, message: ClientMessage) => {
  if (message.t === "ping") pong(peer, message.d.c);
  if (message.t === "queue.join") joinQueue(peer, message.id, message.d.mapId);
  if (message.t !== "queue.leave") return;
  if (queue?.peer === peer) stopQueue();
  peer.deliver({ t: "ack", id: message.id });
};

const handleMatch = (peer: FakePeer, current: MatchRoom, message: ClientMessage) => {
  if (message.t === "ping") pong(peer, message.d.c);
  else current.handle(message);
};

const parse = (data: string) => {
  try {
    const parsed = clientMessageSchema.safeParse(JSON.parse(data));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const connectMatch = (peer: FakePeer, url: URL) => {
  const current = room;
  if (current === null || !url.href.startsWith(`${MATCH_ENDPOINT}${current.matchId}`)) {
    return null;
  }
  current.attach(peer.deliver);
  if (url.searchParams.has("resume")) current.sendSnapshot();
  else current.start();
  return current;
};

export const fakeGameServer = {
  connect: (url: string, peer: FakePeer) => {
    peers.add(peer);
    const parsed = new URL(url);
    const current = url.startsWith(FAKE_WS_ORIGIN) ? null : connectMatch(peer, parsed);
    return {
      receive: (data: string) => {
        const message = parse(data);
        if (message === null) return;
        if (current === null) handleEntry(peer, message);
        else handleMatch(peer, current, message);
      },
      disconnect: () => {
        peers.delete(peer);
        if (current !== null) current.detach(peer.deliver);
      },
    };
  },
  configure: (next: Partial<FakeGameOptions>) => {
    options = { ...options, ...next };
  },
  closeConnections: (code: number, reason = "") =>
    [...peers].forEach((peer) => peer.close(code, reason)),
  reset: () => {
    stopQueue();
    room?.dispose();
    room = null;
    peers = new Set();
    options = DEFAULT_OPTIONS;
    matchCount = 0;
  },
};
