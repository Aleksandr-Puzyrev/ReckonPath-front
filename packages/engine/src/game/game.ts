import {
  BOMB_PENALTY_MOVES,
  BUOY_BONUS_MOVES,
  DEFAULT_ENGINE_CONFIG,
  PVP_BOMB_MOVES,
  PVP_BOMB_SKIP_TURNS,
} from "../config/engine-config";
import { allPairs } from "../distance/distance";
import { cellCount, gridNeighbors } from "../grid/grid";
import type {
  Board,
  GameEvent,
  GameState,
  GameVariant,
  HeatConfig,
  Idx,
  LevelRules,
  Reveal,
  Stars,
  TapResult,
} from "../model/types";
import { compareHotCold, computeHeatD, directionOf, heatOf, probeValue } from "../probe/probe";

interface InitOptions {
  variant?: GameVariant;
  heatConfig?: HeatConfig;
}

type Marks = { beacon?: true; buoy?: true };

export const bombNear = (state: GameState, idx: Idx) =>
  state.rules.bombHint &&
  gridNeighbors(state.board, idx).some(
    ({ idx: neighbor }) => state.board.bombs.includes(neighbor) && !state.bombsHit.has(neighbor),
  );

const probeReveal = (
  state: GameState,
  idx: Idx,
  marks: Marks,
): { reveal: Reveal; lastValue: number | null } => {
  const shared = { epoch: state.epoch, bombNear: bombNear(state, idx), ...marks };
  const probeMode = state.variant === "pvp" ? "distance" : state.rules.probeMode;

  if (probeMode === "direction") {
    return {
      reveal: { kind: "direction", dir: directionOf(state, idx), ...shared },
      lastValue: state.lastValue,
    };
  }
  const value = probeValue(state, idx);
  if (probeMode === "hotcold") {
    const cmp = compareHotCold(value, state.lastValue);
    return { reveal: { kind: "hotcold", cmp, value, ...shared }, lastValue: value };
  }

  const heat = heatOf(value, state.heatD, state.heatConfig);
  return { reveal: { kind: "distance", value, heat, ...shared }, lastValue: state.lastValue };
};

const withReveal = (state: GameState, idx: Idx, reveal: Reveal) => ({
  ...state,
  revealed: new Map(state.revealed).set(idx, reveal),
});

export const moveLimitOf = (state: GameState) =>
  state.variant === "pvp" || state.rules.moveLimit === null
    ? null
    : state.rules.moveLimit + state.bonusMoves;

export const stars = (state: GameState): Stars | null => {
  const thresholds = state.rules.stars;
  if (thresholds === null) return null;
  if (state.continued) return 1;
  if (state.movesUsed <= thresholds[0]) return 3;
  if (state.movesUsed <= thresholds[1]) return 2;

  return 1;
};

export const isStale = (state: GameState, reveal: Reveal) =>
  "epoch" in reveal && reveal.epoch < state.epoch;

export const initGame = (board: Board, rules: LevelRules, options: InitOptions = {}): GameState => {
  const dist = allPairs(board);
  const initial: GameState = {
    board,
    rules,
    variant: options.variant ?? "level",
    heatConfig: options.heatConfig ?? DEFAULT_ENGINE_CONFIG.heat,
    dist,
    revealed: new Map(),
    found: new Set(),
    bombsHit: new Set(),
    movesUsed: 0,
    bonusMoves: 0,
    continued: false,
    epoch: 0,
    lastValue: null,
    heatD: computeHeatD(board, dist),
    status: "playing",
  };

  // Beacons are free and do not start the hot/cold comparison, so lastValue stays null (маяки бесплатны и не начинают сравнение «горячо/холодно», lastValue остаётся null).
  const revealed = new Map(
    board.beacons.map((beacon) => [beacon, probeReveal(initial, beacon, { beacon: true }).reveal]),
  );
  return { ...initial, revealed };
};

const tapBomb = (state: GameState, idx: Idx): TapResult => {
  const isPvp = state.variant === "pvp";
  const event: GameEvent = isPvp
    ? { type: "bomb", cell: idx, skipNext: PVP_BOMB_SKIP_TURNS }
    : { type: "bomb", cell: idx, penalty: BOMB_PENALTY_MOVES };
  return {
    state: {
      ...withReveal(state, idx, { kind: "bomb" }),
      movesUsed: state.movesUsed + (isPvp ? PVP_BOMB_MOVES : BOMB_PENALTY_MOVES),
      bombsHit: new Set([...state.bombsHit, idx]),
    },
    events: [event],
  };
};

const tapTarget = (state: GameState, idx: Idx): TapResult => {
  const { targets, targetOrder } = state.board;
  const found = new Set([...state.found, idx]);
  const reveal: Reveal = {
    kind: "target",
    bombNear: bombNear(state, idx),
    ...(targetOrder ? { order: targets.indexOf(idx) + 1 } : {}),
  };
  const next: GameState = {
    ...withReveal(state, idx, reveal),
    found,
    movesUsed: state.movesUsed + 1,
    epoch: state.epoch + 1,
    lastValue: null,
  };
  const events: GameEvent[] = [
    { type: "targetFound", cell: idx, left: targets.length - found.size },
  ];
  if (found.size < targets.length) return { state: next, events };

  const won: GameState = { ...next, status: "won" };
  return {
    state: won,
    events: [...events, { type: "win", moves: won.movesUsed, stars: stars(won) }],
  };
};

const tapProbe = (state: GameState, idx: Idx): TapResult => {
  const isBuoy = state.board.buoys.includes(idx);
  const { reveal, lastValue } = probeReveal(state, idx, isBuoy ? { buoy: true } : {});
  const next: GameState = {
    ...withReveal(state, idx, reveal),
    lastValue,
    movesUsed: state.movesUsed + 1,
    bonusMoves: state.bonusMoves + (isBuoy ? BUOY_BONUS_MOVES : 0),
  };
  const event: GameEvent = isBuoy
    ? { type: "buoy", cell: idx, bonus: BUOY_BONUS_MOVES }
    : { type: "reveal", cell: idx, reveal };
  return { state: next, events: [event] };
};

const applyMoveLimit = ({ state, events }: TapResult): TapResult => {
  const limit = moveLimitOf(state);
  if (state.status !== "playing" || limit === null || state.movesUsed < limit) {
    return { state, events };
  }
  return {
    state: { ...state, movesUsed: Math.min(state.movesUsed, limit), status: "lost" },
    events: [...events, { type: "lose" }],
  };
};

export const applyTap = (state: GameState, idx: Idx): TapResult => {
  if (state.status !== "playing") return { state, events: [] };
  if (!Number.isInteger(idx) || idx < 0 || idx >= cellCount(state.board)) {
    throw new RangeError(`Cell index ${idx} is outside the board`);
  }
  if (state.board.kinds[idx] === "rock") return { state, events: [{ type: "blocked", cell: idx }] };
  if (state.revealed.has(idx)) return { state, events: [{ type: "alreadyRevealed", cell: idx }] };

  if (state.board.bombs.includes(idx)) return applyMoveLimit(tapBomb(state, idx));
  if (state.board.targets.includes(idx)) return applyMoveLimit(tapTarget(state, idx));
  return applyMoveLimit(tapProbe(state, idx));
};

export const canContinue = (state: GameState) =>
  state.status === "lost" && !state.continued && state.rules.moveLimit !== null;

export const continueGame = (
  state: GameState,
  bonusMoves = DEFAULT_ENGINE_CONFIG.continueBonusMoves,
): GameState => {
  if (!canContinue(state)) throw new Error("The game cannot be continued");

  return {
    ...state,
    bonusMoves: state.bonusMoves + bonusMoves,
    continued: true,
    status: "playing",
  };
};
