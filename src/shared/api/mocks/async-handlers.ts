import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { rngFromKey } from "@reckon-path/engine";
import type { MatchOutcome } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { createMatchBoard, tapBoard } from "./fake-game/match-board";
import { PLAYER_NICKNAMES } from "./fake-game/fake-nicknames";
import { ARENA_FORMAT } from "./mock-arena-format";
import { mockLeague, mockTrophies, recordMockMatch } from "./mock-arena-profile";
import { randomMockMap } from "./mock-map-check";
import { mockUrl } from "./mock-url";

type PvpMap = components["schemas"]["PvpMap"];
type Cell = [number, number];

const MAX_TURNS = 40;
const BOMB_TURNS = 2;
const MS_PER_SECOND = 1000;
// The same network allowance as the live match (Part 7 §8.4) (тот же запас на сеть, что и в живом матче).
const NETWORK_ALLOWANCE_MS = 300;
const CLOSED_LOSS_MS = 60_000;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL = 500;

interface AsyncGame {
  id: string;
  map: PvpMap;
  author: { id: string; nickname: string; league: string; trophies: number };
  norm: number;
  game: ReturnType<typeof createMatchBoard>;
  turnsUsed: number;
  deadline: number;
  taps: { turn: number; cell: Cell; outcome: "pelang" | "target" | "bomb"; value: number | null }[];
  finish: Record<string, unknown> | null;
}

const tapSchema = z.object({
  turn: z.number().int(),
  cell: z.tuple([z.number().int(), z.number().int()]),
});

let games = new Map<string, AsyncGame>();
let count = 0;
let fixedMap: { map: PvpMap; botNorm: number } | null = null;

export const resetMockAsync = () => {
  games = new Map();
  count = 0;
  fixedMap = null;
};

// Tests fix the author's map to know its targets and norm (тесты задают карту автора, чтобы знать её цели и норму).
export const setMockAsyncMap = (map: PvpMap, botNorm: number) => {
  fixedMap = { map, botNorm };
};

const turnMs = () => ARENA_FORMAT.turnSec * MS_PER_SECOND + NETWORK_ALLOWANCE_MS;

const outcomeOf = (turnsUsed: number, norm: number, isSolved: boolean): MatchOutcome => {
  if (!isSolved || turnsUsed > norm) return "loss";
  return turnsUsed === norm ? "draw" : "win";
};

const finish = (entry: AsyncGame, isSolved: boolean) => {
  const outcome = outcomeOf(entry.turnsUsed, entry.norm, isSolved);
  const recorded = recordMockMatch({
    outcome,
    kind: "async",
    opponentTrophies: entry.author.trophies,
    details: {
      matchId: entry.id,
      mode: "async",
      opponent: {
        id: entry.author.id,
        nickname: entry.author.nickname,
        league: entry.author.league,
        isBot: false,
        label: null,
      },
      result: outcome,
      reason: "targets",
      turns: { me: entry.turnsUsed, opponent: entry.norm },
      endedAt: new Date().toISOString(),
      maps: { mine: entry.map, opponent: entry.map },
      taps: entry.taps.map((tap) => ({ ...tap, player: "me" as const })),
    },
  });
  entry.finish = {
    finished: true,
    result: outcome,
    turnsUsed: entry.turnsUsed,
    norm: entry.norm,
    trophiesDelta: recorded.trophies.delta,
    rp: recorded.rp,
    rewards: recorded.rewards,
    map: { targets: entry.map.targets, bombs: entry.map.bombs ?? [] },
  };
  return entry.finish;
};

// Late taps cost the turns they missed, as the server counts timeouts by the deadline (опоздавший тап стоит пропущенных ходов: сервер считает тайм-ауты по дедлайну).
const missedTurns = (deadline: number, now: number) =>
  now <= deadline ? 0 : 1 + Math.floor((now - deadline) / turnMs());

const layoutOf = ({ rows, cols, fences, streams, bridges, heavy, rocks }: PvpMap) => ({
  rows,
  cols,
  fences,
  streams,
  bridges,
  heavy,
  rocks,
});

const start = () => {
  const random = fixedMap ?? randomMockMap(ARENA_FORMAT);
  if (random === null) return null;
  count += 1;
  const rng = rngFromKey(`fake-async-${count}`);
  const trophies = mockTrophies();
  const entry: AsyncGame = {
    id: `async_${count}`,
    map: random.map,
    author: {
      id: `author_${count}`,
      nickname: PLAYER_NICKNAMES[Math.floor(rng() * PLAYER_NICKNAMES.length)] ?? "",
      league: mockLeague(trophies),
      trophies,
    },
    norm: random.botNorm,
    game: createMatchBoard(random.map, ARENA_FORMAT.bombHint),
    turnsUsed: 0,
    deadline: Date.now() + turnMs(),
    taps: [],
    finish: null,
  };
  games.set(entry.id, entry);
  return entry;
};

const tap = (entry: AsyncGame, cell: Cell, now: number) => {
  if (now - entry.deadline > CLOSED_LOSS_MS) return finish(entry, false);
  const result = tapBoard(entry.game, cell);
  if (typeof result === "string") return null;
  entry.turnsUsed +=
    missedTurns(entry.deadline, now) + (result.outcome === "bomb" ? BOMB_TURNS : 1);
  entry.game = result.game;
  entry.taps.push({ turn: entry.turnsUsed, cell, outcome: result.outcome, value: result.value });
  const isSolved = result.game.found.size === entry.map.targets.length;
  if (isSolved || entry.turnsUsed >= MAX_TURNS) return finish(entry, isSolved);
  entry.deadline = now + turnMs();
  return {
    turn: entry.turnsUsed,
    outcome: result.outcome,
    value: result.value,
    bombNear: result.bombNear,
    turnsUsed: entry.turnsUsed,
    deadline: new Date(entry.deadline).toISOString(),
  };
};

const notFound = () =>
  HttpResponse.json({ error: { code: "NOT_FOUND" } }, { status: HTTP_NOT_FOUND });

export const asyncHandlers = [
  http.post(mockUrl("/arena/async"), () => {
    const entry = start();
    if (entry === null)
      return HttpResponse.json({ error: { code: "INTERNAL" } }, { status: HTTP_INTERNAL });
    return HttpResponse.json(
      {
        asyncId: entry.id,
        author: {
          id: entry.author.id,
          nickname: entry.author.nickname,
          league: entry.author.league,
        },
        map: layoutOf(entry.map),
        bombCount: entry.map.bombs?.length ?? 0,
        targetsCount: entry.map.targets.length,
        norm: entry.norm,
        turnSec: ARENA_FORMAT.turnSec,
        bombHint: ARENA_FORMAT.bombHint,
        deadline: new Date(entry.deadline).toISOString(),
      },
      { status: HTTP_CREATED },
    );
  }),
  http.post(mockUrl("/arena/async/:id/tap"), async ({ request, params }) => {
    const entry = games.get(String(params.id));
    if (entry === undefined) return notFound();
    if (entry.finish !== null) return HttpResponse.json(entry.finish);
    const body = tapSchema.safeParse(await request.json().catch(() => null));
    const answer = body.success ? tap(entry, body.data.cell, Date.now()) : null;
    if (answer === null) {
      return HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST });
    }
    return HttpResponse.json(answer);
  }),
  http.post(mockUrl("/arena/async/:id/surrender"), ({ params }) => {
    const entry = games.get(String(params.id));
    if (entry === undefined) return notFound();
    return HttpResponse.json(entry.finish ?? finish(entry, false));
  }),
];
