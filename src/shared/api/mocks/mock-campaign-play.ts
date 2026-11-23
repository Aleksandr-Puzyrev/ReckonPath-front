import { canContinue, toIdx } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import {
  CONTINUE_COST,
  mockGameView,
  replayMockGame,
  secretsOf,
  starsOfMockGame,
  tapsOf,
} from "./mock-campaign-game";
import type { MockGame } from "./mock-campaign-game";
import {
  LEVEL_REWARDS,
  activeMockGame,
  findMockLevel,
  isMockLevelUnlocked,
  mockCampaignState,
  updateMockCampaign,
} from "./mock-campaign";
import type { MockCampaignLevel } from "./mock-campaign-content";
import { MOCK_CAMPAIGN_LEVELS } from "./mock-campaign-content";
import { creditXp } from "./mock-player";
import { chargeEmeralds, creditCoins, creditEmeralds, mockWallet } from "./mock-wallet";

type CampaignGame = components["schemas"]["CampaignGame"];
type CampaignGameResult = components["schemas"]["CampaignGameResult"];
type CellView = components["schemas"]["CellView"];

export type MockReply<T> =
  { data: T } | { error: string; status: number; details?: Record<string, unknown> };

const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const XP_FIRST = 10;
const WORLD_GEMS = 10;
const WORLD_PERFECT_GEMS = 25;
const FULL_STARS = 3;

const fail = (error: string, status: number, details?: Record<string, unknown>) => ({
  error,
  status,
  ...(details === undefined ? {} : { details }),
});

const saveGame = (game: MockGame) =>
  updateMockCampaign({
    games: [...mockCampaignState().games.filter(({ id }) => id !== game.id), game],
  });

const loadGame = (id: string) => {
  const game = mockCampaignState().games.find((saved) => saved.id === id);
  const level = game === undefined ? null : findMockLevel(game.level);
  return game === undefined || level === null ? null : { game, level };
};

const walletView = () => ({ coins: mockWallet().coins, gems: mockWallet().emeralds });

export const playMockLevel = (number: number, isRestart: boolean): MockReply<CampaignGame> => {
  const level = findMockLevel(number);
  if (level === null) return fail("level_not_found", HTTP_NOT_FOUND);
  if (!isMockLevelUnlocked(number)) return fail("level_locked", HTTP_FORBIDDEN);
  const active = activeMockGame(number);
  if (active !== null && !isRestart) return { data: mockGameView(active, level.level) };
  if (active !== null) saveGame({ ...active, isAbandoned: true, isFinished: true });
  const { nextId } = mockCampaignState();
  const game: MockGame = {
    id: `game-${nextId}`,
    level: number,
    actions: [],
    isAbandoned: false,
    isFinished: false,
    result: null,
  };
  updateMockCampaign({ nextId: nextId + 1 });
  saveGame(game);
  return { data: mockGameView(game, level.level) };
};

export const getMockGame = (id: string): MockReply<CampaignGame> => {
  const loaded = loadGame(id);
  if (loaded === null) return fail("game_not_found", HTTP_NOT_FOUND);
  return { data: mockGameView(loaded.game, loaded.level.level) };
};

const payWorld = (level: MockCampaignLevel) => {
  const { progress, paidWorlds } = mockCampaignState();
  const worldLevels = MOCK_CAMPAIGN_LEVELS.filter(({ world }) => world === level.world);
  const isDone = worldLevels.every(({ number }) => progress[number] !== undefined);
  const isPerfect = worldLevels.every(({ number }) => progress[number]?.stars === FULL_STARS);
  const payments: [boolean, string, number][] = [
    [isDone, `done:${level.world}`, WORLD_GEMS],
    [isPerfect, `perfect:${level.world}`, WORLD_PERFECT_GEMS],
  ];
  const due = payments.filter(([isDue, key]) => isDue && !paidWorlds.includes(key));
  due.forEach(([, , gems]) => creditEmeralds(gems));
  updateMockCampaign({ paidWorlds: [...paidWorlds, ...due.map(([, key]) => key)] });
  return due.reduce((total, [, , gems]) => total + gems, 0);
};

// Only the growth of stars is paid, so replaying a level does not farm coins (платится только прирост звёзд: переигровка не фармит монеты).
const recordWin = (level: MockCampaignLevel, stars: number, moves: number): CampaignGameResult => {
  const { progress, earned } = mockCampaignState();
  const previous = progress[level.number];
  const bestMoves = Math.min(previous?.bestMoves ?? moves, moves);
  updateMockCampaign({
    progress: {
      ...progress,
      [level.number]: { stars: Math.max(previous?.stars ?? 0, stars), bestMoves },
    },
  });
  const already = earned[level.number] ?? 0;
  const forStars = Math.max(0, (LEVEL_REWARDS[stars - 1] ?? 0) - already);
  creditCoins(forStars);
  updateMockCampaign({ earned: { ...earned, [level.number]: already + forStars } });
  const xp = previous === undefined ? XP_FIRST : 0;
  creditXp(xp);
  const worldGems = payWorld(level);
  const next = MOCK_CAMPAIGN_LEVELS.find(({ number }) => number > level.number);
  return {
    stars,
    moves,
    bestMoves,
    newRecord: previous === undefined || moves < previous.bestMoves,
    reward: forStars,
    xp,
    ...(worldGems > 0 ? { worldGems } : {}),
    canContinue: false,
    continueCost: CONTINUE_COST,
    ...(next === undefined ? {} : { nextLevel: next.number }),
    secrets: secretsOf(level.level),
    wallet: walletView(),
  };
};

export const tapMockGame = (
  id: string,
  { row, col, seq }: { row: number; col: number; seq: number },
): MockReply<{ cell: CellView; game: CampaignGame }> => {
  const loaded = loadGame(id);
  if (loaded === null) return fail("game_not_found", HTTP_NOT_FOUND);
  const { game, level } = loaded;
  const before = replayMockGame(level.level, game.actions);
  if (game.isFinished || before.status !== "playing") return fail("game_over", HTTP_CONFLICT);
  if (seq !== tapsOf(game.actions)) {
    return fail("stale_game", HTTP_CONFLICT, mockGameView(game, level.level));
  }
  const { rows, cols } = before.board;
  if (row < 0 || col < 0 || row >= rows || col >= cols)
    return fail("invalid_cell", HTTP_UNPROCESSABLE);
  const idx = toIdx(cols, [row, col]);
  if (before.board.kinds[idx] === "rock") return fail("invalid_cell", HTTP_UNPROCESSABLE);
  if (before.revealed.has(idx)) return fail("cell_open", HTTP_CONFLICT);

  const actions = [...game.actions, { tap: idx }];
  const after = replayMockGame(level.level, actions);
  const isWon = after.status === "won";
  const next: MockGame = {
    ...game,
    actions,
    isFinished: isWon,
    result: isWon ? recordWin(level, starsOfMockGame(after), after.movesUsed) : null,
  };
  saveGame(next);
  const view = mockGameView(next, level.level);
  const cell = view.cells.find((opened) => opened.row === row && opened.col === col);
  if (cell === undefined) return fail("internal_error", HTTP_CONFLICT);
  return { data: { cell, game: view } };
};

export const continueMockGame = (id: string, seq: number): MockReply<CampaignGame> => {
  const loaded = loadGame(id);
  if (loaded === null) return fail("game_not_found", HTTP_NOT_FOUND);
  const { game, level } = loaded;
  const state = replayMockGame(level.level, game.actions);
  if (game.isFinished || !canContinue(state)) return fail("cannot_continue", HTTP_CONFLICT);
  if (seq !== tapsOf(game.actions)) {
    return fail("stale_game", HTTP_CONFLICT, mockGameView(game, level.level));
  }
  if (!chargeEmeralds(CONTINUE_COST)) {
    return fail("not_enough_gems", HTTP_CONFLICT, {
      need: CONTINUE_COST - mockWallet().emeralds,
      currency: "gems",
    });
  }
  const next: MockGame = { ...game, actions: [...game.actions, { continue: true }] };
  saveGame(next);
  return { data: mockGameView(next, level.level) };
};

export const giveUpMockGame = (id: string): MockReply<CampaignGame> => {
  const loaded = loadGame(id);
  if (loaded === null) return fail("game_not_found", HTTP_NOT_FOUND);
  const { game, level } = loaded;
  const state = replayMockGame(level.level, game.actions);
  if (game.isFinished || state.status !== "lost") return fail("game_not_lost", HTTP_CONFLICT);
  const result: CampaignGameResult = {
    stars: 0,
    moves: state.movesUsed,
    newRecord: false,
    reward: 0,
    xp: 0,
    canContinue: false,
    continueCost: CONTINUE_COST,
  };
  const next: MockGame = { ...game, isAbandoned: true, isFinished: true, result };
  saveGame(next);
  return { data: mockGameView(next, level.level) };
};
