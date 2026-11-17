import { createBoard, toIdx } from "@reckon-path/engine";
import type { Direction, GameStatus, Idx, ProbeMode, Reveal } from "@reckon-path/engine";

import type { CampaignGame, CellView } from "./campaign-types";
import type { PlayView } from "./play-view";
import { campaignLevelId, levelOfPublicBoard } from "./public-board-level";
import type { ServerGame } from "./server-game";

const DIRECTIONS: Record<NonNullable<CellView["direction"]>, Direction> = {
  up: "N",
  right: "E",
  down: "S",
  left: "W",
};

const STATUSES: Record<CampaignGame["status"], GameStatus> = {
  play: "playing",
  won: "won",
  lost: "lost",
  abandoned: "lost",
};

const NO_LIMIT = 0;

const marksOf = (cell: CellView) => ({
  epoch: cell.epoch,
  bombNear: cell.nearBomb === true,
  ...(cell.kind === "beacon" ? { beacon: true as const } : {}),
  ...(cell.kind === "buoy" ? { buoy: true as const } : {}),
});

const answerOf = (cell: CellView, mode: ProbeMode): Reveal => {
  if (mode === "direction") {
    return { kind: "direction", dir: DIRECTIONS[cell.direction ?? "up"], ...marksOf(cell) };
  }
  if (mode === "hotcold") {
    // The server keeps the number of a hot-cold answer to itself; nothing draws it (сервер не отдаёт число ответа «горячо-холодно», его ничего не рисует).
    return { kind: "hotcold", cmp: cell.compare ?? "none", value: 0, ...marksOf(cell) };
  }
  return { kind: "distance", value: cell.value ?? 0, heat: cell.tone ?? "cold", ...marksOf(cell) };
};

export const revealOfCell = (cell: CellView, mode: ProbeMode): Reveal => {
  if (cell.kind === "bomb") return { kind: "bomb" };
  if (cell.kind === "target") {
    return {
      kind: "target",
      bombNear: cell.nearBomb === true,
      ...(cell.order === undefined ? {} : { order: cell.order }),
    };
  }
  return answerOf(cell, mode);
};

export const cellIdxOf = (cols: number, { row, col }: Pick<CellView, "row" | "col">): Idx =>
  toIdx(cols, [row, col]);

export const playViewOfServerGame = (game: ServerGame, levelId: string): PlayView => {
  const { board, rules } = createBoard(
    levelOfPublicBoard(game.board, levelId, game.result?.secrets),
  );
  const revealed = new Map(
    game.cells.map((cell) => [cellIdxOf(board.cols, cell), revealOfCell(cell, rules.probeMode)]),
  );
  const taps = game.cells.filter(({ kind }) => kind !== "beacon");
  const lastTap = taps.at(-1);
  const openedBuoys = game.cells.filter(({ kind }) => kind === "buoy").length;

  return {
    board,
    rules,
    revealed,
    epoch: game.epoch,
    status: STATUSES[game.status],
    movesUsed: game.moves,
    continued: (game.continues ?? 0) > 0,
    moveLimit: game.limit === NO_LIMIT ? null : game.limit,
    targetCount: game.board.targets,
    foundCount: game.found,
    bombCount: game.board.bombs,
    bombsLeft: game.bombsLeft,
    buoyCount: game.board.buoys,
    buoysLeft: game.board.buoys - openedBuoys,
    lastCell: lastTap === undefined ? null : cellIdxOf(board.cols, lastTap),
  };
};

export const playViewOfCampaignGame = (game: CampaignGame) =>
  playViewOfServerGame(game, campaignLevelId(game.level));
