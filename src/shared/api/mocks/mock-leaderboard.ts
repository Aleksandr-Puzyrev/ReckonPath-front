import type { components } from "../generated/schema";

import type { MockReply } from "./mock-campaign-play";
import { mockSeason } from "./mock-arena";
import { MOCK_ME_ID, MOCK_PLAYERS, mockFriendIds } from "./mock-friends";

type Leaderboard = components["schemas"]["Leaderboard"];
type LeaderboardPeriod = components["schemas"]["LeaderboardPeriod"];
type LeaderboardScope = components["schemas"]["LeaderboardScope"];

interface MockScore {
  id: string;
  name: string;
  league: string;
  value: number;
}

const HTTP_UNPROCESSABLE = 422;
const DAY_MS = 86_400_000;
const WEEK_DAYS = 7;
const MONDAY = 1;
const MAX_LIMIT = 100;
const ME: Omit<MockScore, "value"> = { id: MOCK_ME_ID, name: "Player4821", league: "silver" };
const MY_SEASON_TROPHIES = 1640;

// The weekly value is the net change since Monday, so a losing week goes below zero (недельное значение — чистое изменение с понедельника, поэтому проигранная неделя уходит в минус).
const WEEK_VALUES: Readonly<Record<string, number>> = {
  "mock-1": 184,
  "mock-2": 142,
  "player-5": 96,
  "player-8": 40,
  "mock-5": 12,
  "player-4": 0,
  "player-7": -18,
};

const PERIODS: readonly string[] = ["week", "season"] satisfies LeaderboardPeriod[];
const SCOPES: readonly string[] = ["all", "country", "friends"] satisfies LeaderboardScope[];

const isPeriod = (value: string): value is LeaderboardPeriod => PERIODS.includes(value);
const isScope = (value: string): value is LeaderboardScope => SCOPES.includes(value);

const nextMondayOf = (now: number) => {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  const daysToMonday = (MONDAY - new Date(today).getUTCDay() + WEEK_DAYS) % WEEK_DAYS || WEEK_DAYS;
  return new Date(today + daysToMonday * DAY_MS).toISOString();
};

// I have not played this week, so the week board has no row of mine (на этой неделе я не играл, поэтому в недельной таблице моей строки нет).
const scoresOf = (period: LeaderboardPeriod): MockScore[] => {
  if (period === "week") {
    return MOCK_PLAYERS.flatMap(({ id, name, league }) => {
      const value = WEEK_VALUES[id];
      return value === undefined ? [] : [{ id, name, league, value }];
    });
  }
  return [
    ...MOCK_PLAYERS.map(({ id, name, league, trophies }) => ({
      id,
      name,
      league,
      value: trophies,
    })),
    { ...ME, value: MY_SEASON_TROPHIES },
  ];
};

export const mockLeaderboard = (
  period: string,
  scope: string,
  limit: number,
  now = Date.now(),
): MockReply<Leaderboard> => {
  if (
    !isPeriod(period) ||
    !isScope(scope) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    return { error: "validation_failed", status: HTTP_UNPROCESSABLE };
  }
  const endsAt = period === "week" ? nextMondayOf(now) : mockSeason(now).endsAt;
  if (scope === "country") return { data: { period, scope, endsAt, items: [] } };
  const members = new Set([...mockFriendIds(), MOCK_ME_ID]);
  const rows = scoresOf(period)
    .filter(({ id }) => scope === "all" || members.has(id))
    .sort((left, right) => right.value - left.value)
    .map((score, index) => ({ rank: index + 1, ...score }));
  const me = rows.find(({ id }) => id === MOCK_ME_ID);
  return {
    data: {
      period,
      scope,
      endsAt,
      items: rows.slice(0, limit),
      ...(me === undefined ? {} : { me }),
    },
  };
};
