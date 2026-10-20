import {
  applyTrophies,
  divisionOf,
  LEAGUES,
  leagueOf,
  rankPoints,
  RP_PER_TRACK_STEP,
  TRACK_STEPS,
  trackStep,
  trophyDelta,
  xpFor,
} from "@reckon-path/engine";
import type { MatchKind, MatchOutcome } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { creditXp } from "./mock-player";
import { creditCoins, creditEmeralds } from "./mock-wallet";

type ArenaProfile = components["schemas"]["Arena"]["profile"];
type MatchDetails = components["schemas"]["MatchDetails"];
type SeasonStep = components["schemas"]["SeasonStep"];
type SeasonReward = components["schemas"]["SeasonReward"];
type SeasonSummary = components["schemas"]["SeasonSummary"];

const STATE_NAME = "arena-profile";
const DAY_MS = 86_400_000;
const DIVISIONS = 3;
const DIVISION_NUMBERS = { III: 3, II: 2, I: 1 } as const;
const WIN_COINS = 40;
const FIRST_WINS_EMERALDS = 3;
const FIRST_WINS_PER_DAY = 3;
// The design's currency rewards in a cycle; the mock catalog has no season items (валютные награды дизайна по кругу; сезонных предметов в каталоге мока нет).
const TRACK_REWARDS: readonly SeasonReward[] = [
  { currency: "coin", amount: 200 },
  { currency: "emerald", amount: 10 },
  { currency: "coin", amount: 400 },
  { currency: "emerald", amount: 20 },
];

// The design 18.3 summary of the season before the mock one, without the season frame the mock catalog lacks (итог прошлого сезона из дизайна 18.3, без сезонной рамки, которой нет в каталоге мока).
const LAST_SEASON: Omit<SeasonSummary, "claimed"> = {
  seasonId: 1,
  peakLeague: "GOLD",
  peakDivision: 1,
  rank: 312,
  wins: 64,
  rewards: [
    { currency: "coin", amount: 1500 },
    { currency: "emerald", amount: 60 },
  ],
  trophiesBefore: 3120,
  trophiesAfter: 2560,
};

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
  claimedSteps: number[];
  onboardingDone: boolean;
  isLastSeasonClaimed: boolean;
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
  claimedSteps: [],
  onboardingDone: false,
  isLastSeasonClaimed: false,
};

// Fields added later get their start values in a state saved before them (поля, добавленные позже, получают начальные значения в состоянии, сохранённом до них).
let state: ArenaProfileState = { ...START_STATE, ...loadMockState(STATE_NAME, START_STATE) };

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

export const mockOnboardingDone = () => state.onboardingDone;

export const completeMockOnboarding = () => {
  state = { ...state, onboardingDone: true };
  saveMockState(STATE_NAME, state);
};

export const mockLastSeason = (): SeasonSummary | null =>
  state.isLastSeasonClaimed ? null : { ...LAST_SEASON, claimed: false };

const creditReward = ({ currency, amount = 0 }: SeasonReward) => {
  if (currency === "coin") creditCoins(amount);
  if (currency === "emerald") creditEmeralds(amount);
};

export const claimMockLastSeason = () => {
  if (state.isLastSeasonClaimed) return { duplicate: true, rewards: LAST_SEASON.rewards };
  LAST_SEASON.rewards.forEach(creditReward);
  state = { ...state, isLastSeasonClaimed: true };
  saveMockState(STATE_NAME, state);
  return { duplicate: false, rewards: LAST_SEASON.rewards };
};

const rewardOf = (step: number) => TRACK_REWARDS[(step - 1) % TRACK_REWARDS.length] ?? {};

const stepStateOf = (step: number): SeasonStep["state"] => {
  if (state.claimedSteps.includes(step)) return "claimed";
  return trackStep(state.rp) >= step ? "available" : "locked";
};

export const mockSeasonTrack = (): SeasonStep[] =>
  Array.from({ length: TRACK_STEPS }, (_, index) => {
    const step = index + 1;
    return { step, rp: step * RP_PER_TRACK_STEP, reward: rewardOf(step), state: stepStateOf(step) };
  });

export const claimMockStep = (step: number) => {
  const stepState = stepStateOf(step);
  if (stepState === "locked") return null;
  const reward = rewardOf(step);
  if (stepState === "claimed") return { duplicate: true, reward };
  creditReward(reward);
  state = { ...state, claimedSteps: [...state.claimedSteps, step] };
  saveMockState(STATE_NAME, state);
  return { duplicate: false, reward, inventoryAdded: [] };
};

interface MatchRecord {
  outcome: MatchOutcome;
  kind: MatchKind;
  opponentTrophies: number;
  details: Omit<MatchDetails, "trophiesDelta">;
}

const ASYNC_WIN_COINS = WIN_COINS / 2;

// An async win pays half the coins and no first-win emeralds (decision 0036 #2) (асинхронная победа даёт половину монет и без изумрудов за первые победы).
const asyncRewardsOf = (outcome: MatchOutcome) => {
  const unchanged = { winDay: state.winDay, winsToday: state.winsToday };
  if (outcome !== "win") return { rewards: [], ...unchanged };
  creditCoins(ASYNC_WIN_COINS);
  return { rewards: [{ currency: "coin", amount: ASYNC_WIN_COINS }], ...unchanged };
};

const rewardsOf = (outcome: MatchOutcome, kind: MatchKind, now: number) => {
  if (kind === "async") return asyncRewardsOf(outcome);
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
  const { rewards, winDay, winsToday } = rewardsOf(outcome, kind, Date.now());
  const xp = xpFor("match") + (outcome === "win" ? xpFor("matchWin") : 0);
  creditXp(xp);
  state = {
    ...state,
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
    rewards: [...rewards, { xp }],
  };
};
