import { toIdx } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import type { MockReply } from "./mock-campaign-play";
import { starsOfMockGame } from "./mock-campaign-game";
import {
  RESTORE_COST,
  createMockDailyGame,
  findMockDailyGame,
  lastMockDailyGame,
  mockDailyGameView,
  mockStreakView,
  mockToday,
  recordMockDailyWin,
  replayMockDaily,
  restoreMockStreak,
  saveMockDailyGame,
} from "./mock-daily";
import type { MockDailyGame } from "./mock-daily";
import { creditXp } from "./mock-player";
import { chargeEmeralds, creditCoins, creditEmeralds, mockWallet } from "./mock-wallet";

type DailyGame = components["schemas"]["DailyGame"];
type CellView = components["schemas"]["CellView"];
type StreakView = components["schemas"]["StreakView"];

const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;

const fail = (error: string, status: number, details?: Record<string, unknown>) => ({
  error,
  status,
  ...(details === undefined ? {} : { details }),
});

export const playMockDaily = (isRestart: boolean): MockReply<DailyGame> => {
  const today = mockToday();
  const last = lastMockDailyGame(today);
  if (last?.status === "won") return fail("daily_done", HTTP_CONFLICT, mockDailyGameView(last));
  if (last?.status === "play" && !isRestart) return { data: mockDailyGameView(last) };
  if (last?.status === "play") saveMockDailyGame({ ...last, status: "abandoned" });
  return { data: mockDailyGameView(createMockDailyGame(today, (last?.attempt ?? 0) + 1)) };
};

export const getMockDailyGame = (id: string): MockReply<DailyGame> => {
  const game = findMockDailyGame(id);
  if (game === undefined) return fail("game_not_found", HTTP_NOT_FOUND);
  return { data: mockDailyGameView(game) };
};

export const tapMockDaily = (
  id: string,
  { row, col, seq }: { row: number; col: number; seq: number },
): MockReply<{ cell: CellView; game: DailyGame }> => {
  const game = findMockDailyGame(id);
  if (game === undefined) return fail("game_not_found", HTTP_NOT_FOUND);
  if (game.status === "play" && game.date < mockToday()) {
    saveMockDailyGame({ ...game, status: "abandoned" });
    return fail("game_over", HTTP_CONFLICT);
  }
  if (game.status !== "play") return fail("game_over", HTTP_CONFLICT);
  if (seq !== game.taps.length) return fail("stale_game", HTTP_CONFLICT, mockDailyGameView(game));
  const before = replayMockDaily(game);
  const { rows, cols } = before.board;
  if (row < 0 || col < 0 || row >= rows || col >= cols)
    return fail("invalid_cell", HTTP_UNPROCESSABLE);
  const idx = toIdx(cols, [row, col]);
  if (before.board.kinds[idx] === "rock") return fail("invalid_cell", HTTP_UNPROCESSABLE);
  if (before.revealed.has(idx)) return fail("cell_open", HTTP_CONFLICT);

  const tapped = { ...game, taps: [...game.taps, idx] };
  const after = replayMockDaily(tapped);
  const status: MockDailyGame["status"] = after.status === "playing" ? "play" : after.status;
  const result =
    status === "won" ? recordMockDailyWin(tapped, starsOfMockGame(after), after.movesUsed) : null;
  if (result !== null) {
    creditCoins(result.coins);
    creditXp(result.xp);
    creditEmeralds(result.streakGems ?? 0);
  }
  const next = { ...tapped, status, result };
  saveMockDailyGame(next);
  const view = mockDailyGameView(next);
  const wallet = { coins: mockWallet().coins, gems: mockWallet().emeralds };
  const shown = result === null ? view : { ...view, result: { ...result, wallet } };
  const cell = shown.cells.find((opened) => opened.row === row && opened.col === col);
  if (cell === undefined) return fail("internal_error", HTTP_CONFLICT);
  return { data: { cell, game: shown } };
};

export const restoreMockDailyStreak = (): MockReply<StreakView> => {
  if (!mockStreakView().restorable) return fail("streak_not_restorable", HTTP_CONFLICT);
  if (!chargeEmeralds(RESTORE_COST)) {
    return fail("not_enough_gems", HTTP_CONFLICT, {
      need: RESTORE_COST - mockWallet().emeralds,
      currency: "gems",
    });
  }
  return { data: restoreMockStreak() };
};
