import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import type { components } from "../generated/schema";

import { mockHistory, MOCK_FORMAT } from "./mock-arena";
import { doneMatchMock, mapMatchMock, playingMatchMock } from "./mock-match";
import { mockUrl } from "./mock-url";

type MatchView = components["schemas"]["MatchView"];
type MoveView = components["schemas"]["MoveView"];

const SECOND_MS = 1000;
const MAP_OFFER_SECONDS = 10;
const BOT_SECONDS = 20;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const tapSchema = z.object({ row: z.number().int(), col: z.number().int(), seq: z.number().int() });

let match: MatchView | null = null;
let joinedAt: number | null = null;

export const resetMockMatch = () => {
  match = null;
  joinedAt = null;
};

export const setMockMatch = (next: MatchView | null) => {
  match = next;
};

const errorResponse = (code: string, status: number) =>
  HttpResponse.json({ error: { code } }, { status });

const at = (time: number, seconds: number) => new Date(time + seconds * SECOND_MS).toISOString();

const queueState = () => {
  if (match !== null) return { match: { id: match.id, kind: match.kind, status: match.status } };
  if (joinedAt === null) return {};
  return {
    queue: {
      joinedAt: new Date(joinedAt).toISOString(),
      serverTime: new Date().toISOString(),
      mapOfferAt: at(joinedAt, MAP_OFFER_SECONDS),
      botAt: at(joinedAt, BOT_SECONDS),
      format: MOCK_FORMAT,
    },
  };
};

const update = (change: (current: MatchView) => Partial<MatchView>) => {
  if (match === null) return errorResponse("match_not_found", HTTP_NOT_FOUND);
  match = { ...match, ...change(match), seq: match.seq + 1, serverTime: new Date().toISOString() };
  return HttpResponse.json(match);
};

export const matchHandlers = [
  http.get(mockUrl("/arena/queue"), () => HttpResponse.json(queueState())),
  http.post(mockUrl("/arena/queue"), () => {
    joinedAt ??= Date.now();
    return HttpResponse.json(queueState());
  }),
  http.delete(mockUrl("/arena/queue"), () => {
    joinedAt = null;
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.post(mockUrl("/arena/map-match"), () => {
    joinedAt = null;
    match = mapMatchMock();
    return HttpResponse.json(match);
  }),
  http.get(mockUrl("/arena/matches/current"), () =>
    match === null ? errorResponse("match_not_found", HTTP_NOT_FOUND) : HttpResponse.json(match),
  ),
  http.get(mockUrl("/arena/history"), ({ request }) => {
    const before = new URL(request.url).searchParams.get("before");
    const items = mockHistory.filter(
      ({ finishedAt }) => before === null || Date.parse(finishedAt) < Date.parse(before),
    );
    const page = items.slice(0, Number(new URL(request.url).searchParams.get("limit") ?? 20));
    const last = page.at(-1);
    return HttpResponse.json({
      items: page,
      ...(page.length < items.length && last !== undefined ? { nextBefore: last.finishedAt } : {}),
    });
  }),
  http.get(mockUrl("/arena/matches/:id"), ({ params }) => {
    const id = String(params.id);
    if (match?.id === id) return HttpResponse.json(match);
    return mockHistory.some(({ matchId }) => matchId === id)
      ? HttpResponse.json(doneMatchMock({ id }))
      : errorResponse("match_not_found", HTTP_NOT_FOUND);
  }),
  http.put(mockUrl("/arena/matches/:id/map"), () => update(() => ({ mapSeenByRival: false }))),
  http.post(mockUrl("/arena/matches/:id/ready"), () =>
    update((current) =>
      current.status === "prepare"
        ? { ...playingMatchMock({ id: current.id }), me: { ...current.me, ready: true } }
        : {},
    ),
  ),
  http.post(mockUrl("/arena/matches/:id/tap"), async ({ request }) => {
    const body = tapSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    if (match === null || match.rivalMap === undefined) {
      return errorResponse("match_not_found", HTTP_NOT_FOUND);
    }
    if (body.data.seq !== match.seq) return errorResponse("stale_state", HTTP_CONFLICT);
    const { row, col } = body.data;
    const board = match.rivalMap;
    return update((current) => {
      const move: MoveView = {
        turn: current.log.length + 1,
        by: "me",
        cell: [row, col],
        kind: "number",
        at: new Date().toISOString(),
      };
      return {
        me: { ...current.me, moves: current.me.moves + 1 },
        rivalMap: {
          ...board,
          revealed: [
            ...board.revealed,
            { row, col, kind: "number", value: 2, tone: "warm", epoch: 0 },
          ],
          taps: [...board.taps, [row, col]],
        },
        log: [...current.log, move],
        last: move,
      };
    });
  }),
  http.post(mockUrl("/arena/matches/:id/surrender"), () =>
    update((current) => ({
      ...doneMatchMock({ id: current.id }),
      result: {
        outcome: "loss",
        reason: "surrender",
        trophies: -(current.surrenderLoss ?? 0),
        trophyNow: current.me.trophies - (current.surrenderLoss ?? 0),
        league: current.me.league,
        coins: 0,
        gems: 0,
        xp: 0,
        rp: 0,
      },
    })),
  ),
];
