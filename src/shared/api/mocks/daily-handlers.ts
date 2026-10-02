import { http, HttpResponse } from "msw/http";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type Attempt = components["schemas"]["Attempt"];

interface CountedDay {
  result: "won" | "lost";
  stars: number | null;
  movesUsed: number;
}

const DAY_MS = 86_400_000;
const DAY_KEY_LENGTH = 10;
const DAILY_ID_PREFIX = "d-";
const MOCK_RANK = 134;
const MOCK_PERCENTILE = 88;
const MOCK_MEDIAN = 9;
const TOP_NAMES = [
  "Nova",
  "Kira",
  "Бриз",
  "Орион",
  "Milo",
  "Эхо",
  "Вега",
  "Лоцман",
  "Прибой",
  "Штурман",
];
const TOP_MOVES = [3, 3, 4, 4, 4, 4, 5, 5, 5, 5];

const STATE_NAME = "daily";

let countedDays = new Map(loadMockState<[string, CountedDay][]>(STATE_NAME, []));

const dayKeyOf = (time: number) => new Date(time).toISOString().slice(0, DAY_KEY_LENGTH);

const streakDays = (today: string) => {
  let current = 0;
  for (let time = Date.parse(today); countedDays.has(dayKeyOf(time)); time -= DAY_MS) current += 1;
  if (current > 0) return current;
  for (let time = Date.parse(today) - DAY_MS; countedDays.has(dayKeyOf(time)); time -= DAY_MS) {
    current += 1;
  }
  return current;
};

export const countDailyAttempt = ({ ref, claimed, continued }: Attempt) => {
  const dayKey = ref.slice(DAILY_ID_PREFIX.length);
  if (countedDays.has(dayKey)) return null;
  countedDays.set(dayKey, {
    result: claimed.result,
    stars: claimed.stars,
    movesUsed: claimed.movesUsed,
  });
  saveMockState(STATE_NAME, [...countedDays.entries()]);
  const current = streakDays(dayKeyOf(Date.now()));
  return {
    daily: { rank: MOCK_RANK, percentile: MOCK_PERCENTILE, ranked: continued !== true },
    streak: { current, best: current },
  };
};

export const resetMockDaily = () => {
  countedDays = new Map();
  clearMockState(STATE_NAME);
};

const TOP = TOP_NAMES.map((nickname, index) => ({
  rank: index + 1,
  user: { id: `mock-${index + 1}`, nickname },
  value: TOP_MOVES[index] ?? 0,
}));

// Fake standings for development, so the daily screen can be seen without a server (выдуманная таблица для разработки, чтобы экран дейли был виден без сервера).
export const dailyHandlers = [
  http.get(mockUrl("/daily/history"), () =>
    HttpResponse.json({
      days: [...countedDays.entries()]
        .sort(([left], [right]) => right.localeCompare(left))
        .map(([date, day]) => ({ date, result: day.result, stars: day.stars, restored: false })),
    }),
  ),
  http.get(mockUrl("/daily/:date"), ({ params }) => {
    const date = String(params.date);
    const day = countedDays.get(date);
    return HttpResponse.json({
      date,
      override: null,
      leaderboardPreview: { top: TOP, median: MOCK_MEDIAN },
      me:
        day === undefined
          ? { played: false, result: null, rank: null }
          : { played: true, result: day.result, rank: MOCK_RANK },
    });
  }),
  http.get(mockUrl("/streak"), () => {
    const today = dayKeyOf(Date.now());
    const lastDay = [...countedDays.keys()].sort().at(-1) ?? dayKeyOf(Date.now() - 2 * DAY_MS);
    const current = streakDays(today);
    return HttpResponse.json({ current, best: current, lastDay, restorable: false });
  }),
];
