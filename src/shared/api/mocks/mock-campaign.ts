import type { components } from "../generated/schema";

import { MOCK_CAMPAIGN_LEVELS, MOCK_WORLDS } from "./mock-campaign-content";
import type { MockCampaignLevel, MockLocale } from "./mock-campaign-content";
import { mockGameView, publicBoardOf } from "./mock-campaign-game";
import type { MockGame } from "./mock-campaign-game";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockWallet } from "./mock-wallet";

type CampaignLevel = components["schemas"]["CampaignLevel"];
type CampaignWorld = components["schemas"]["CampaignWorld"];
type CampaignOverview = components["schemas"]["CampaignOverview"];
type LevelState = components["schemas"]["LevelState"];

export interface MockLevelProgress {
  stars: number;
  bestMoves: number;
}

export interface MockCampaignState {
  progress: Record<string, MockLevelProgress>;
  earned: Record<string, number>;
  tutorials: string[];
  games: MockGame[];
  paidWorlds: string[];
  nextId: number;
}

const STATE_NAME = "campaign";
const EMPTY_STATE: MockCampaignState = {
  progress: {},
  earned: {},
  tutorials: [],
  games: [],
  paidWorlds: [],
  nextId: 1,
};
export const LEVEL_REWARDS = [20, 30, 50] as const;
const FULL_STARS = 3;
const DAILY_UNLOCK_LEVEL = 6;
const ARENA_UNLOCK_LEVEL = 12;

let state = loadMockState<MockCampaignState>(STATE_NAME, EMPTY_STATE);

export const mockCampaignState = () => state;

export const updateMockCampaign = (next: Partial<MockCampaignState>) => {
  state = { ...state, ...next };
  saveMockState(STATE_NAME, state);
};

export const resetMockCampaign = () => {
  state = EMPTY_STATE;
  clearMockState(STATE_NAME);
};

export const findMockLevel = (number: number) =>
  MOCK_CAMPAIGN_LEVELS.find((level) => level.number === number) ?? null;

export const mockCurrentLevel = () =>
  MOCK_CAMPAIGN_LEVELS.find(({ number }) => state.progress[number] === undefined)?.number ?? 0;

export const mockPassedLevels = () => Object.keys(state.progress).length;

export const isMockLevelUnlocked = (number: number) => {
  const current = mockCurrentLevel();
  return state.progress[number] !== undefined || current === 0 || number <= current;
};

const isPassed = (number: number) => {
  const current = mockCurrentLevel();
  return current === 0 || current > number;
};

const stateOf = (number: number): LevelState => {
  const progress = state.progress[number];
  if (progress !== undefined) return progress.stars === FULL_STARS ? "perfect" : "done";
  return isMockLevelUnlocked(number) ? "current" : "locked";
};

const pluralOf = (count: number, locale: MockLocale, [en, one, few, many]: readonly string[]) => {
  if (locale === "en") return `${count} ${en}${count === 1 ? "" : "s"}`;
  const tens = count % 10;
  const hundreds = count % 100;
  if (tens === 1 && hundreds !== 11) return `${count} ${one}`;
  const isFew = tens >= 2 && tens <= 4 && (hundreds < 12 || hundreds > 14);
  return `${count} ${isFew ? few : many}`;
};

const TARGET_WORDS = ["target", "цель", "цели", "целей"] as const;
const BOMB_WORDS = ["bomb", "бомба", "бомбы", "бомб"] as const;

// The same summary as the backend's: size, then targets and bombs when there are any (та же сводка, что у бэкенда: размер, затем цели и бомбы, если они есть).
const descriptionOf = ({ level }: MockCampaignLevel, locale: MockLocale) => {
  const board = publicBoardOf(level);
  const parts = [`${board.rows}×${board.cols}`];
  if (board.targets > 1) parts.push(pluralOf(board.targets, locale, TARGET_WORDS));
  if (board.bombs > 0) parts.push(pluralOf(board.bombs, locale, BOMB_WORDS));
  return parts.join(" · ");
};

export const mockLevelView = (level: MockCampaignLevel, locale: MockLocale): CampaignLevel => {
  const progress = state.progress[level.number];
  return {
    number: level.number,
    title: level.title[locale],
    description: descriptionOf(level, locale),
    rows: level.level.rows,
    cols: level.level.cols,
    mode: publicBoardOf(level.level).mode,
    elements: level.elements,
    introduces: level.introduces,
    ...(level.tutorial === null ? {} : { tutorial: level.tutorial }),
    state: stateOf(level.number),
    stars: progress?.stars ?? 0,
    ...(progress === undefined ? {} : { bestMoves: progress.bestMoves }),
    rewards: [...LEVEL_REWARDS],
    coinsEarned: state.earned[level.number] ?? 0,
  };
};

const worldStateOf = (levels: readonly CampaignLevel[]): LevelState => {
  if (levels.every(({ state: level }) => level === "locked")) return "locked";
  if (levels.every(({ state: level }) => level === "perfect")) return "perfect";
  if (levels.every(({ state: level }) => level === "done" || level === "perfect")) return "done";
  return "current";
};

const worldsOf = (locale: MockLocale): CampaignWorld[] =>
  MOCK_WORLDS.map((world) => {
    const levels = MOCK_CAMPAIGN_LEVELS.filter((level) => level.world === world.number).map(
      (level) => mockLevelView(level, locale),
    );
    return {
      number: world.number,
      title: world.title[locale],
      subtitle: world.subtitle[locale],
      colorFrom: world.colorFrom,
      colorTo: world.colorTo,
      firstLevel: levels[0]?.number ?? 0,
      lastLevel: levels.at(-1)?.number ?? 0,
      stars: levels.reduce((total, { stars }) => total + stars, 0),
      starsMax: FULL_STARS * levels.length,
      state: worldStateOf(levels),
      levels,
    };
  });

export const activeMockGame = (number: number) =>
  state.games.find((game) => game.level === number && !game.isFinished) ?? null;

const activeOf = (current: number) => {
  const game = activeMockGame(current);
  const level = findMockLevel(current);
  if (game === null || level === null) return {};
  const view = mockGameView(game, level.level);
  return {
    active: { gameId: game.id, level: current, found: view.found, total: view.board.targets },
  };
};

export const mockOverview = (locale: MockLocale): CampaignOverview => {
  const worlds = worldsOf(locale);
  const levels = worlds.flatMap((world) => world.levels);
  const current = mockCurrentLevel();
  const known = new Set(
    MOCK_CAMPAIGN_LEVELS.filter(
      ({ number }) => state.progress[number] !== undefined || activeMockGame(number) !== null,
    ).flatMap(({ elements, introduces }) => [...elements, ...introduces]),
  );
  const { emeralds, coins } = mockWallet();
  return {
    stars: levels.reduce((total, { stars }) => total + stars, 0),
    starsMax: FULL_STARS * levels.length,
    levelsDone: levels.filter(({ state: level }) => level === "done" || level === "perfect").length,
    perfect: levels.filter(({ state: level }) => level === "perfect").length,
    coinsEarned: levels.reduce((total, { coinsEarned }) => total + coinsEarned, 0),
    currentLevel: current,
    completed: current === 0,
    unlocks: {
      dailyLevel: DAILY_UNLOCK_LEVEL,
      arenaLevel: ARENA_UNLOCK_LEVEL,
      daily: isPassed(DAILY_UNLOCK_LEVEL),
      arena: isPassed(ARENA_UNLOCK_LEVEL),
    },
    knownElements: [...known].sort(),
    tutorials: state.tutorials,
    ...activeOf(current),
    wallet: { coins, gems: emeralds },
    worlds,
  };
};

const CLIENT_TUTORIALS = ["flags", "distance", "home_tour", "moves_hint", "arena_editor"];

export const isKnownTutorialKey = (key: string) =>
  CLIENT_TUTORIALS.includes(key) ||
  MOCK_CAMPAIGN_LEVELS.some(
    ({ tutorial, introduces }) => tutorial === key || introduces.includes(key),
  );

const TEST_BEST_MOVES = 5;

export const passMockLevels = (count: number, stars = FULL_STARS) =>
  updateMockCampaign({
    progress: Object.fromEntries(
      MOCK_CAMPAIGN_LEVELS.slice(0, count).map(({ number }) => [
        number,
        { stars, bestMoves: TEST_BEST_MOVES },
      ]),
    ),
  });
