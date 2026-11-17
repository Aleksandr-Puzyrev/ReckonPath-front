import { http, HttpResponse } from "msw/http";
import type { JsonBodyType } from "msw";

import {
  DAILY_REWARDS,
  mockDailyDay,
  mockDailyHistory,
  mockDailyLeaderboard,
  mockStreakView,
  mockToday,
} from "./mock-daily";
import type { MockReply } from "./mock-campaign-play";
import {
  getMockDailyGame,
  playMockDaily,
  restoreMockDailyStreak,
  tapMockDaily,
} from "./mock-daily-play";
import { mockUrl } from "./mock-url";

const HISTORY_LIMIT = 30;
const MAX_HISTORY_LIMIT = 90;

const reply = <T extends JsonBodyType>(result: MockReply<T>) =>
  "data" in result
    ? HttpResponse.json(result.data)
    : HttpResponse.json(
        {
          error: {
            code: result.error,
            ...(result.details === undefined ? {} : { details: result.details }),
          },
        },
        { status: result.status },
      );

const readBody = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null ? { ...body } : {};
  } catch {
    return {};
  }
};

const numberOf = (value: unknown) => (typeof value === "number" ? value : -1);

const limitOf = (request: Request) => {
  const limit = Number(new URL(request.url).searchParams.get("limit"));
  return limit > 0 && limit <= MAX_HISTORY_LIMIT ? limit : HISTORY_LIMIT;
};

// The daily as server games, like the backend: attempts until the first win, the top and the streak (дейли как партии сервера, как у бэкенда: попытки до первой победы, топ и серия).
export const dailyHandlers = [
  http.get(mockUrl("/daily"), () =>
    HttpResponse.json({
      day: mockDailyDay(mockToday()),
      streak: mockStreakView(),
      rewards: DAILY_REWARDS,
    }),
  ),
  http.get(mockUrl("/daily/history"), ({ request }) =>
    HttpResponse.json({ days: mockDailyHistory(limitOf(request)) }),
  ),
  http.get(mockUrl("/daily/leaderboard"), ({ request }) =>
    HttpResponse.json(
      mockDailyLeaderboard(new URL(request.url).searchParams.get("date") ?? mockToday()),
    ),
  ),
  http.post(mockUrl("/daily/play"), async ({ request }) => {
    const body = await readBody(request);
    return reply(playMockDaily(body.restart === true));
  }),
  http.get<{ id: string }>(mockUrl("/daily/games/:id"), ({ params }) =>
    reply(getMockDailyGame(params.id)),
  ),
  http.post<{ id: string }>(mockUrl("/daily/games/:id/tap"), async ({ request, params }) => {
    const body = await readBody(request);
    return reply(
      tapMockDaily(params.id, {
        row: numberOf(body.row),
        col: numberOf(body.col),
        seq: numberOf(body.seq),
      }),
    );
  }),
  http.get<{ date: string }>(mockUrl("/daily/:date"), ({ params }) =>
    HttpResponse.json(mockDailyDay(params.date)),
  ),
  http.get(mockUrl("/streak"), () => HttpResponse.json(mockStreakView())),
  http.post(mockUrl("/streak/restore"), () => reply(restoreMockDailyStreak())),
];
