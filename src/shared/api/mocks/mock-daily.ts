import { generateDaily, moveLimitOf } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { cellViewOf, publicBoardOf, replayMockGame, secretsOf } from "./mock-campaign-game";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";

type DailyGame = components["schemas"]["DailyGame"];
type DailyGameResult = components["schemas"]["DailyGameResult"];
type DailyDay = components["schemas"]["DailyDay"];
type DailyEntry = components["schemas"]["DailyEntry"];
type StreakView = components["schemas"]["StreakView"];

export interface MockDailyGame {
  id: string;
  date: string;
  attempt: number;
  taps: number[];
  status: DailyGame["status"];
  result: DailyGameResult | null;
}

interface MockDailyResult {
  stars: number;
  moves: number;
  attempts: number;
}

export interface MockStreak {
  current: number;
  best: number;
  lastDay: string | null;
  restoredAt: number | null;
}

interface MockDailyState {
  nextId: number;
  games: MockDailyGame[];
  results: Record<string, MockDailyResult>;
  streak: MockStreak;
}

const STATE_NAME = "daily-games";
const EMPTY_STATE: MockDailyState = {
  nextId: 1,
  games: [],
  results: {},
  streak: { current: 0, best: 0, lastDay: null, restoredAt: null },
};
const DAY_MS = 86_400_000;
const DAY_KEY_LENGTH = 10;
const NO_LIMIT = 0;
export const DAILY_REWARDS = { coins: 30, coinsPerStar: 10, xp: 15, topSize: 10, topGems: 10 };
const STREAK_GEMS: Record<number, number> = { 3: 5, 7: 15, 14: 30, 30: 60 };
export const RESTORE_COST = 30;
const RESTORE_DAYS = 7;
const TOP_NAMES = ["Nova", "Kira", "Бриз", "Орион", "Milo", "Эхо", "Вега", "Лоцман"];
const TOP_MOVES = [3, 3, 4, 4, 5, 5, 6, 6];
const FULL_STARS = 3;

let state = loadMockState<MockDailyState>(STATE_NAME, EMPTY_STATE);
let levelOverride: LevelInput | null = null;

const save = (next: Partial<MockDailyState>) => {
  state = { ...state, ...next };
  saveMockState(STATE_NAME, state);
};

export const mockToday = () => new Date(Date.now()).toISOString().slice(0, DAY_KEY_LENGTH);

const nextDayAt = () => new Date((Math.floor(Date.now() / DAY_MS) + 1) * DAY_MS);

const daysBefore = (dayKey: string, days: number) =>
  new Date(Date.parse(dayKey) - days * DAY_MS).toISOString().slice(0, DAY_KEY_LENGTH);

export const mockDailyLevel = (date: string): LevelInput =>
  levelOverride === null ? generateDaily(date).level : { ...levelOverride, id: `d-${date}` };

// Tests play a small known board instead of the generated one (тесты играют маленькое известное поле вместо сгенерированного).
export const setMockDailyLevel = (level: LevelInput | null) => {
  levelOverride = level;
};

export const setMockStreak = (streak: MockStreak) => save({ streak });

export const resetMockDaily = () => {
  state = EMPTY_STATE;
  levelOverride = null;
  clearMockState(STATE_NAME);
};

export const findMockDailyGame = (id: string) => state.games.find((game) => game.id === id);

export const lastMockDailyGame = (date: string) =>
  state.games.filter((game) => game.date === date).sort((a, b) => b.attempt - a.attempt)[0];

export const saveMockDailyGame = (game: MockDailyGame) =>
  save({ games: [...state.games.filter(({ id }) => id !== game.id), game] });

export const createMockDailyGame = (date: string, attempt: number) => {
  const game: MockDailyGame = {
    id: `daily-${state.nextId}`,
    date,
    attempt,
    taps: [],
    status: "play",
    result: null,
  };
  save({ nextId: state.nextId + 1 });
  saveMockDailyGame(game);
  return game;
};

export const replayMockDaily = (game: MockDailyGame) =>
  replayMockGame(
    mockDailyLevel(game.date),
    game.taps.map((tap) => ({ tap })),
  );

export const mockDailyGameView = (game: MockDailyGame): DailyGame => {
  const level = mockDailyLevel(game.date);
  const played = replayMockDaily(game);
  const lost =
    game.status === "lost" ? { stars: 0, moves: played.movesUsed, coins: 0, xp: 0 } : null;
  const result = game.result ?? lost;
  return {
    id: game.id,
    date: game.date,
    title: "",
    attempt: game.attempt,
    seq: game.taps.length,
    status: game.status,
    board: publicBoardOf(level),
    moves: played.movesUsed,
    limit: moveLimitOf(played) ?? NO_LIMIT,
    found: played.found.size,
    bombsLeft: played.board.bombs.length - played.bombsHit.size,
    epoch: played.epoch,
    cells: [...played.revealed].map(([idx, reveal]) => cellViewOf(played, idx, reveal)),
    ...(result === null ? {} : { result }),
  };
};

const restorableOf = (now: number) =>
  state.streak.restoredAt === null || now >= state.streak.restoredAt + RESTORE_DAYS * DAY_MS;

export const mockStreakView = (): StreakView => {
  const today = mockToday();
  const { current, best, lastDay, restoredAt } = state.streak;
  const isAlive = lastDay !== null && lastDay >= daysBefore(today, 1);
  const isBroken = lastDay === daysBefore(today, 2) && current > 0;
  const restorable = isBroken && restorableOf(Date.now());
  const live = isAlive ? current : 0;
  return {
    current: live,
    best,
    ...(lastDay === null ? {} : { lastDay }),
    todayDone: lastDay === today,
    ...(isBroken ? { broken: current } : {}),
    restorable,
    restoreCost: RESTORE_COST,
    ...(isBroken && !restorable && restoredAt !== null
      ? { restoreAt: new Date(restoredAt + RESTORE_DAYS * DAY_MS).toISOString() }
      : {}),
    milestones: Object.entries(STREAK_GEMS).map(([days, gems]) => ({
      days: Number(days),
      gems,
      reached: live >= Number(days),
    })),
  };
};

export const restoreMockStreak = () => {
  save({
    streak: { ...state.streak, lastDay: daysBefore(mockToday(), 1), restoredAt: Date.now() },
  });
  return mockStreakView();
};

const extendStreak = (date: string) => {
  const { current, best, lastDay } = state.streak;
  if (lastDay === date) return current;
  const next = lastDay === daysBefore(date, 1) ? current + 1 : 1;
  save({ streak: { ...state.streak, current: next, best: Math.max(best, next), lastDay: date } });
  return next;
};

export const recordMockDailyWin = (game: MockDailyGame, stars: number, moves: number) => {
  save({ results: { ...state.results, [game.date]: { stars, moves, attempts: game.attempt } } });
  const streak = extendStreak(game.date);
  const streakGems = STREAK_GEMS[streak] ?? 0;
  return {
    stars,
    moves,
    coins: DAILY_REWARDS.coins + DAILY_REWARDS.coinsPerStar * stars,
    xp: DAILY_REWARDS.xp,
    streak,
    ...(streakGems > 0 ? { streakGems } : {}),
    secrets: secretsOf(mockDailyLevel(game.date)),
  };
};

const TOP: DailyEntry[] = TOP_NAMES.map((name, index) => ({
  rank: index + 1,
  id: `mock-${index + 1}`,
  name,
  stars: FULL_STARS,
  moves: TOP_MOVES[index] ?? 0,
  attempts: 1,
}));

// The backend's order: more stars, then fewer attempts, then fewer moves (порядок бэкенда: больше звёзд, затем меньше попыток, затем меньше ходов).
const isBetter = (entry: DailyEntry, mine: MockDailyResult) => {
  if (entry.stars !== mine.stars) return entry.stars > mine.stars;
  if (entry.attempts !== mine.attempts) return entry.attempts < mine.attempts;
  return entry.moves <= mine.moves;
};

const mineOf = (date: string): DailyEntry | null => {
  const mine = state.results[date];
  if (mine === undefined) return null;
  const rank = TOP.filter((entry) => isBetter(entry, mine)).length + 1;
  return { rank, id: "me", me: true, ...mine };
};

export const mockDailyLeaderboard = (date: string) => {
  const mine = mineOf(date);
  if (mine === null) return { date, entries: TOP };
  const position = (mine.rank ?? 1) - 1;
  const entries = [...TOP.slice(0, position), mine, ...TOP.slice(position)].map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
  return { date, entries, mine };
};

export const mockDailyDay = (date: string): DailyDay => {
  const today = mockToday();
  const level = mockDailyLevel(date);
  const mine = mineOf(date);
  const last = date === today ? lastMockDailyGame(date) : undefined;
  return {
    date,
    today: date === today,
    title: "",
    size: [level.rows, level.cols],
    players: TOP.length + (mine === null ? 0 : 1),
    ...(mine === null ? {} : { mine }),
    ...(last === undefined ? {} : { gameId: last.id, status: last.status, attempts: last.attempt }),
    nextDayAt: nextDayAt().toISOString(),
  };
};

export const mockDailyHistory = (limit: number) =>
  Object.entries(state.results)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, limit)
    .map(([date, result]) => ({ date, ...result }));
