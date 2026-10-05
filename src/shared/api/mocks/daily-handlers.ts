import { http, HttpResponse } from "msw/http";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type Attempt = components["schemas"]["Attempt"];

interface CountedDay {
  result: "won" | "lost" | null;
  stars: number | null;
  movesUsed: number;
  restored?: boolean;
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
const RESTORE_STATE_NAME = "daily-restore";
const RESTORE_PRICE = 30;
const RESTORE_COOLDOWN_DAYS = 7;

let countedDays = new Map(loadMockState<[string, CountedDay][]>(STATE_NAME, []));
let lastRestoreDay = loadMockState<string | null>(RESTORE_STATE_NAME, null);

const dayKeyOf = (time: number) => new Date(time).toISOString().slice(0, DAY_KEY_LENGTH);
const daysBefore = (dayKey: string, days: number) => dayKeyOf(Date.parse(dayKey) - days * DAY_MS);

const streakEnding = (dayKey: string) => {
  let current = 0;
  for (let time = Date.parse(dayKey); countedDays.has(dayKeyOf(time)); time -= DAY_MS) current += 1;
  return current;
};

const lastCountedDay = () => [...countedDays.keys()].sort().at(-1) ?? null;

const streakDays = (today: string) => {
  const lastDay = lastCountedDay();
  if (lastDay === today || lastDay === daysBefore(today, 1)) return streakEnding(lastDay);
  return 0;
};

const canRestore = (today: string) =>
  lastCountedDay() === daysBefore(today, 2) &&
  (lastRestoreDay === null || lastRestoreDay < daysBefore(today, RESTORE_COOLDOWN_DAYS));

const saveDays = () => saveMockState(STATE_NAME, [...countedDays.entries()]);

export const streakRestorePrice = () => RESTORE_PRICE;

export const restoreMockStreak = () => {
  const today = dayKeyOf(Date.now());
  const yesterday = daysBefore(today, 1);
  countedDays.set(yesterday, { result: null, stars: null, movesUsed: 0, restored: true });
  lastRestoreDay = today;
  saveDays();
  saveMockState(RESTORE_STATE_NAME, lastRestoreDay);
  const current = streakEnding(yesterday);
  return { current, best: current };
};

export const countDailyAttempt = ({ ref, claimed, continued }: Attempt) => {
  const dayKey = ref.slice(DAILY_ID_PREFIX.length);
  if (countedDays.has(dayKey)) return null;
  countedDays.set(dayKey, {
    result: claimed.result,
    stars: claimed.stars,
    movesUsed: claimed.movesUsed,
  });
  saveDays();
  const current = streakDays(dayKeyOf(Date.now()));
  return {
    daily: { rank: MOCK_RANK, percentile: MOCK_PERCENTILE, ranked: continued !== true },
    streak: { current, best: current },
  };
};

export const resetMockDaily = () => {
  countedDays = new Map();
  lastRestoreDay = null;
  clearMockState(STATE_NAME);
  clearMockState(RESTORE_STATE_NAME);
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
        .map(([date, day]) => ({
          date,
          result: day.result,
          stars: day.stars,
          restored: day.restored === true,
        })),
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
    const lastDay = lastCountedDay() ?? daysBefore(today, 2);
    const isMissedYesterday = lastDay === daysBefore(today, 2);
    const current = isMissedYesterday ? streakEnding(lastDay) : streakDays(today);
    const restorable = canRestore(today);
    return HttpResponse.json({
      current,
      best: current,
      lastDay,
      restorable,
      ...(restorable
        ? {
            restoreUntil: new Date(Date.parse(today) + DAY_MS).toISOString(),
            restoreMethods: ["ad", "emeralds"],
            price: RESTORE_PRICE,
          }
        : {}),
    });
  }),
];
