import {
  applyTap,
  canContinue,
  continueGame,
  createBoard,
  initGame,
  levelToBackend,
  moveLimitOf,
  stars,
  toCell,
} from "@reckon-path/engine";
import type { GameState, Idx, LevelInput, Reveal } from "@reckon-path/engine";

import type { components } from "../generated/schema";

type CampaignGame = components["schemas"]["CampaignGame"];
type CampaignGameResult = components["schemas"]["CampaignGameResult"];
type CellView = components["schemas"]["CellView"];

export type MockAction = { tap: Idx } | { continue: true };

export interface MockGame {
  id: string;
  level: number;
  actions: MockAction[];
  isAbandoned: boolean;
  isFinished: boolean;
  result: CampaignGameResult | null;
}

export const CONTINUE_COST = 15;
const NO_LIMIT = 0;
const FULL_STARS = 3;

const DIRECTIONS = { N: "up", E: "right", S: "down", W: "left" } as const;

export const replayMockGame = (level: LevelInput, actions: readonly MockAction[]) => {
  const { board, rules } = createBoard(level);
  return actions.reduce<GameState>(
    (state, action) => ("tap" in action ? applyTap(state, action.tap).state : continueGame(state)),
    initGame(board, rules),
  );
};

export const tapsOf = (actions: readonly MockAction[]) =>
  actions.filter((action) => "tap" in action).length;

const answerOf = (reveal: Reveal) => {
  if (reveal.kind === "distance") return { value: reveal.value, tone: reveal.heat };
  if (reveal.kind === "direction") return { direction: DIRECTIONS[reveal.dir] };
  if (reveal.kind === "hotcold") return { compare: reveal.cmp };
  return {};
};

const kindOf = (reveal: Reveal): CellView["kind"] => {
  if (reveal.kind === "target" || reveal.kind === "bomb") return reveal.kind;
  if (reveal.beacon === true) return "beacon";
  return reveal.buoy === true ? "buoy" : "number";
};

export const cellViewOf = (state: GameState, idx: Idx, reveal: Reveal): CellView => {
  const [row, col] = toCell(state.board.cols, idx);
  const base = { row, col, kind: kindOf(reveal) };
  if (reveal.kind === "bomb") return { ...base, epoch: 0 };
  if (reveal.kind === "target") {
    return {
      ...base,
      epoch: 0,
      ...(reveal.bombNear ? { nearBomb: true } : {}),
      ...(state.board.targetOrder && reveal.order !== undefined ? { order: reveal.order } : {}),
    };
  }
  return {
    ...base,
    epoch: reveal.epoch,
    ...(reveal.bombNear ? { nearBomb: true } : {}),
    ...answerOf(reveal),
  };
};

const pointsOf = (list: readonly (readonly [number, number])[] | undefined) =>
  (list ?? []).map(([row, col]): [number, number] => [row, col]);

export const secretsOf = (level: LevelInput) => {
  const backend = levelToBackend(level);
  return {
    targets: pointsOf(backend.targets),
    bombs: pointsOf(backend.bombs),
    buoys: pointsOf(backend.buoys),
  };
};

export const publicBoardOf = (level: LevelInput) => {
  const backend = levelToBackend(level);
  return {
    rows: backend.rows,
    cols: backend.cols,
    terrain: [...backend.terrain],
    fences: (backend.fences ?? []).map(([from, to]): [[number, number], [number, number]] => [
      [from[0], from[1]],
      [to[0], to[1]],
    ]),
    beacons: pointsOf(backend.beacons),
    mode: backend.mode,
    fog: backend.fog ?? 0,
    order: backend.order ?? false,
    limit: backend.limit,
    stars: [...backend.stars],
    targets: backend.targets.length,
    bombs: (backend.bombs ?? []).length,
    buoys: (backend.buoys ?? []).length,
  };
};

export const starsOfMockGame = (state: GameState) => stars(state) ?? FULL_STARS;

const statusOf = (game: MockGame, state: GameState): CampaignGame["status"] => {
  if (game.isAbandoned) return "abandoned";
  if (state.status === "playing") return "play";
  return state.status;
};

const lostResultOf = (state: GameState): CampaignGameResult => ({
  stars: 0,
  moves: state.movesUsed,
  newRecord: false,
  reward: 0,
  xp: 0,
  canContinue: canContinue(state),
  continueCost: CONTINUE_COST,
});

export const mockGameView = (game: MockGame, level: LevelInput): CampaignGame => {
  const state = replayMockGame(level, game.actions);
  const status = statusOf(game, state);
  const result = status === "lost" ? lostResultOf(state) : game.result;
  return {
    id: game.id,
    level: game.level,
    version: 1,
    seq: tapsOf(game.actions),
    status,
    board: publicBoardOf(level),
    moves: state.movesUsed,
    limit: moveLimitOf(state) ?? NO_LIMIT,
    found: state.found.size,
    bombsLeft: state.board.bombs.length - state.bombsHit.size,
    epoch: state.epoch,
    continues: state.continued ? 1 : 0,
    cells: [...state.revealed].map(([idx, reveal]) => cellViewOf(state, idx, reveal)),
    ...(result === null ? {} : { result }),
  };
};
