import type { components } from "../generated/schema";

import { mockPassedLevels } from "./mock-campaign";
import { creditCoins, creditEmeralds, mockWallet } from "./mock-wallet";

type Schemas = components["schemas"];
type ArenaHome = Schemas["ArenaHome"];
type SeasonView = Schemas["SeasonView"];
type TrackStepView = Schemas["TrackStepView"];
type HistoryItem = Schemas["HistoryItem"];
type ArenaMapView = Schemas["ArenaMapView"];

const ARENA_UNLOCK_LEVEL = 12;
const DAY_MS = 86_400_000;
const SEASON_DAYS = 28;
const SEASON_NUMBER = 2;
const HISTORY_SIZE = 25;
const MINUTE_MS = 60_000;

export const MOCK_FORMAT: Schemas["MatchFormat"] = {
  rows: 6,
  cols: 6,
  targets: 1,
  moveSeconds: 10,
  league: "bronze",
  leagueTitle: "Bronze",
  caps: { stream: 4, bridge: 1, heavy: 2, rock: 3, bombs: 2, fences: 4 },
};

export const MOCK_LEAGUE: Schemas["LeagueView"] = {
  league: "bronze",
  title: "Bronze",
  division: "III",
  min: 0,
  next: { league: "bronze", title: "Bronze", division: "II", min: 200 },
  floor: 0,
  format: MOCK_FORMAT,
};

const START_TRACK: TrackStepView[] = [
  { id: 1, rp: 0, coins: 200, gems: 0, state: "ready" },
  { id: 2, rp: 50, coins: 0, gems: 10, state: "locked" },
  { id: 3, rp: 100, coins: 400, gems: 0, state: "locked" },
];

const PAST_SEASON: Schemas["SeasonResult"] = {
  number: 1,
  peak: 3120,
  league: { league: "gold", title: "Gold", division: "I", min: 2800 },
  rank: 312,
  wins: 64,
  trophiesBefore: 3120,
  trophiesAfter: 2560,
  coins: 1500,
  gems: 60,
};

const historyItem = (index: number): HistoryItem => ({
  matchId: `match-${index + 1}`,
  kind: index % 4 === 3 ? "bot" : "duel",
  outcome: index % 3 === 0 ? "loss" : "win",
  reason: "targets",
  rival: { id: `player-${index}`, name: `Rival${index + 1}` },
  moves: 8,
  rivalMoves: 9,
  trophies: index % 3 === 0 ? -12 : 16,
  finishedAt: new Date(Date.UTC(2026, 10, 1) - index * MINUTE_MS).toISOString(),
});

interface MockArenaState {
  rulesSeen: boolean;
  track: TrackStepView[];
  hasPastSeason: boolean;
}

const START_STATE: MockArenaState = { rulesSeen: true, track: START_TRACK, hasPastSeason: false };

let state = START_STATE;

export const resetMockArena = () => {
  state = START_STATE;
};

export const setMockArena = (next: Partial<MockArenaState>) => {
  state = { ...state, ...next };
};

export const markMockRulesSeen = () => setMockArena({ rulesSeen: true });

export const mockHistory = Array.from({ length: HISTORY_SIZE }, (_, index) => historyItem(index));

export const mockSeason = (now = Date.now()): SeasonView => ({
  number: SEASON_NUMBER,
  startsAt: new Date(now - DAY_MS).toISOString(),
  endsAt: new Date(now + SEASON_DAYS * DAY_MS).toISOString(),
  rp: 60,
  peak: 120,
  track: state.track,
  ready: state.track.filter(({ state: step }) => step === "ready").length,
  ...(state.hasPastSeason ? { result: PAST_SEASON } : {}),
});

const walletOf = () => ({ coins: mockWallet().coins, gems: mockWallet().emeralds });

const credit = (coins: number, gems: number) => {
  creditCoins(coins);
  creditEmeralds(gems);
  return { coins, gems, wallet: walletOf(), season: mockSeason() };
};

export const claimMockStep = (id: number) => {
  const step = state.track.find((item) => item.id === id);
  if (step === undefined) return "step_not_found";
  if (step.state === "locked") return "step_locked";
  if (step.state === "claimed") return "step_claimed";
  setMockArena({
    track: state.track.map((item) => (item.id === id ? { ...item, state: "claimed" } : item)),
  });
  return credit(step.coins, step.gems);
};

export const claimMockPastSeason = () => {
  if (!state.hasPastSeason) return null;
  setMockArena({ hasPastSeason: false });
  return credit(PAST_SEASON.coins, PAST_SEASON.gems);
};

export const arenaHomeMock = (maps: readonly ArenaMapView[], now = Date.now()): ArenaHome => {
  const activeMap = maps.find(({ active }) => active);
  return {
    serverTime: new Date(now).toISOString(),
    unlocked: mockPassedLevels() >= ARENA_UNLOCK_LEVEL,
    unlockLevel: ARENA_UNLOCK_LEVEL,
    rulesSeen: state.rulesSeen,
    trophies: 120,
    rank: 1532,
    league: MOCK_LEAGUE,
    stats: {
      matches: 10,
      wins: 6,
      losses: 3,
      draws: 1,
      winRate: 60,
      streak: 2,
      bestStreak: 4,
      peak: 120,
    },
    ...(activeMap === undefined ? {} : { activeMap }),
    maps: maps.length,
    maxMaps: 3,
    rewards: {
      winCoins: 40,
      drawCoins: 15,
      lossCoins: 10,
      winGems: 3,
      gemWinsLeft: 2,
      botFactor: 50,
    },
    history: mockHistory.slice(0, 5),
    timing: { prepareSeconds: 60, vsSeconds: 3, mapOfferAfter: 10, botAfter: 20, maxTimeouts: 3 },
    season: mockSeason(now),
  };
};
