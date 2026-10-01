import type { HeatConfig } from "../model/types";

export interface RatingConfig {
  base: number;
  divisor: number;
  min: number;
  max: number;
  bronzeLossCap: number;
}

export interface EngineConfig {
  heat: HeatConfig;
  continueBonusMoves: number;
  rating: RatingConfig;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  heat: { hotPct: 0.2, warmPct: 0.45 },
  continueBonusMoves: 3,
  rating: { base: 30, divisor: 25, min: 10, max: 50, bronzeLossCap: 15 },
};

export const BUOY_BONUS_MOVES = 3;
export const BOMB_PENALTY_MOVES = 2;
export const PVP_BOMB_MOVES = 1;
export const PVP_BOMB_SKIP_TURNS = 1;
export const LEVEL_SOLVER_BOMB_PENALTY = 2;
export const PVP_SOLVER_BOMB_PENALTY = 1;
export const MAX_BEACONS = 3;
export const MAX_BUOYS = 2;
export const FOG_MIN = 2;
export const FOG_MAX = 4;
export const MIN_BOARD_SIZE = 4;
export const MAX_BOARD_SIZE = 9;
export const MIN_TARGETS = 1;
export const MAX_TARGETS = 5;
export const MAX_BOMBS = 5;
export const PASSABLE_CELLS_PER_BOMB = 12;
export const MAX_ROCK_SHARE = 0.25;
export const MAX_CELL_COORDINATE = MAX_BOARD_SIZE - 1;
export const TITLE_MAX_LENGTH = 40;
export const MAX_WORLD = 8;
export const MAX_MOVE_LIMIT = 99;
