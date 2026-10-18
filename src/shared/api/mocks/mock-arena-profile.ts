import {
  applyTrophies,
  divisionOf,
  LEAGUES,
  leagueOf,
  rankPoints,
  trophyDelta,
} from "@reckon-path/engine";
import type { MatchKind, MatchOutcome } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { creditCoins, creditEmeralds } from "./mock-wallet";

type ArenaProfile = components["schemas"]["Arena"]["profile"];
type MatchDetails = components["schemas"]["MatchDetails"];

const STATE_NAME = "arena-profile";
const DAY_MS = 86_400_000;
const DIVISIONS = 3;
const DIVISION_NUMBERS = { III: 3, II: 2, I: 1 } as const;
const WIN_COINS = 40;
const FIRST_WINS_EMERALDS = 3;
const FIRST_WINS_PER_DAY = 3;

interface ArenaProfileState {
  trophies: number;
  peak: number;
  seasonFloor: number;
  rp: number;
  wins: number;
  losses: number;
  draws: number;
  winDay: number;
  winsToday: number;
  history: MatchDetails[];
}

const START_STATE: ArenaProfileState = {
  trophies: 0,
  peak: 0,
  seasonFloor: 0,
  rp: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winDay: 0,
  winsToday: 0,
  history: [],
};

let state = loadMockState<ArenaProfileState>(STATE_NAME, START_STATE);

export const resetMockArenaProfile = () => {
  state = START_STATE;
  clearMockState(STATE_NAME);
};

const rangeOf = (trophies: number) =>
  LEAGUES.find(({ league }) => league === leagueOf(trophies)) ?? { min: 0, max: 0 };

const divisionRange = (trophies: number) => {
  const { min, max } = rangeOf(trophies);
  if (!Number.isFinite(max)) return { divisionMin: min, divisionMax: trophies };
  const width = (max - min) / DIVISIONS;
  const index = Math.floor((trophies - min) / width);
  return {
    divisionMin: Math.round(min + index * width),
    divisionMax: Math.round(min + (index + 1) * width),
  };
};

export const mockTrophies = () => state.trophies;

export const mockLeague = (trophies: number) => leagueOf(trophies).toUpperCase();

export const mockDivision = (trophies: number) => DIVISION_NUMBERS[divisionOf(trophies) ?? "I"];

export const mockArenaProfile = (): ArenaProfile => ({
  trophies: state.trophies,
  league: mockLeague(state.trophies),
  division: mockDivision(state.trophies),
  ...divisionRange(state.trophies),
  peak: state.peak,
  rp: state.rp,
  wins: state.wins,
  losses: state.losses,
  draws: state.draws,
});

export const mockMatchHistory = () => state.history;

interface MatchRecord {
  outcome: MatchOutcome;
  kind: MatchKind;
  opponentTrophies: number;
  details: Omit<MatchDetails, "trophiesDelta">;
}

const rewardsOf = (outcome: MatchOutcome, now: number) => {
  if (outcome !== "win") return { rewards: [], winDay: state.winDay, winsToday: state.winsToday };
  const day = Math.floor(now / DAY_MS);
  const winsBefore = day === state.winDay ? state.winsToday : 0;
  creditCoins(WIN_COINS);
  const rewards: Record<string, unknown>[] = [{ currency: "coin", amount: WIN_COINS }];
  if (winsBefore < FIRST_WINS_PER_DAY) {
    creditEmeralds(FIRST_WINS_EMERALDS);
    rewards.push({ currency: "emerald", amount: FIRST_WINS_EMERALDS });
  }
  return { rewards, winDay: day, winsToday: winsBefore + 1 };
};

export const recordMockMatch = ({ outcome, kind, opponentTrophies, details }: MatchRecord) => {
  const before = state.trophies;
  const raw = trophyDelta({ myTrophies: before, opponentTrophies, outcome, kind });
  const after = applyTrophies(before, raw, state.seasonFloor);
  const rp = rankPoints(outcome, kind);
  const { rewards, winDay, winsToday } = rewardsOf(outcome, Date.now());
  state = {
    trophies: after,
    peak: Math.max(state.peak, after),
    seasonFloor: Math.max(state.seasonFloor, rangeOf(after).min),
    rp: state.rp + rp,
    wins: state.wins + (outcome === "win" ? 1 : 0),
    losses: state.losses + (outcome === "loss" ? 1 : 0),
    draws: state.draws + (outcome === "draw" ? 1 : 0),
    winDay,
    winsToday,
    history: [{ ...details, trophiesDelta: after - before }, ...state.history],
  };
  saveMockState(STATE_NAME, state);
  return {
    trophies: { before, after, delta: after - before },
    league: { changed: leagueOf(before) !== leagueOf(after) },
    rp,
    rewards,
  };
};
