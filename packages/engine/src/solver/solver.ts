import { cellCount, gridNeighbors, passableNeighbors, UNREACHABLE } from "../grid/grid";
import type {
  Direction,
  GameEvent,
  GameState,
  HotColdCompare,
  Idx,
  ProbeMode,
} from "../model/types";
import { pick, rngFromKey } from "../random/random";
import type { Rng } from "../random/random";

import {
  binomial,
  forEachTuple,
  MAX_FULL_SPACE,
  SAMPLE_SIZE,
  sampleIndices,
  sampleTuples,
  spaceSize,
} from "./combinations";

type Hypothesis = readonly number[];
type Observation = (hypothesis: Hypothesis) => boolean;

interface SolverView {
  levelId: string;
  penalty: number;
  size: number;
  rocks: ReadonlySet<Idx>;
  dist: Int16Array;
  neighbors: readonly (readonly { dir: Direction; idx: Idx }[])[];
  gridNeighbors: readonly (readonly Idx[])[];
  candidates: readonly Idx[];
  targetCount: number;
  bombCount: number;
  probeMode: ProbeMode;
  targetOrder: boolean;
  bombHint: boolean;
  isSampled: boolean;
}

interface BombFlag {
  cell: Idx;
  flag: boolean;
  time: number;
}

export interface SolverState {
  view: SolverView;
  hypotheses: Hypothesis[];
  found: ReadonlySet<Idx>;
  revealed: ReadonlySet<Idx>;
  prevAnswer: Idx | null;
  bombFlags: readonly BombFlag[];
  exploded: ReadonlyMap<Idx, number>;
  time: number;
  observations: readonly Observation[];
  resampleRound: number;
}

interface SolverOptions {
  levelId: string;
  penalty: number;
}

const DIRECTION_INDEX: Record<Direction, number> = { N: 0, E: 1, S: 2, W: 3 };
const COMPARE_INDEX: Record<HotColdCompare, number> = { none: 0, warmer: 1, colder: 2, same: 3 };
const TIE_TOLERANCE = 1e-9;
const TARGET_KEY = -1;
const KEY_OFFSET = -TARGET_KEY;
const NO_NEIGHBOR_VALUE = UNREACHABLE + 1;

const probeOf = (view: SolverView, found: ReadonlySet<Idx>, hypothesis: Hypothesis, cell: Idx) => {
  const row = cell * view.size;
  if (view.targetOrder) {
    const next = hypothesis.find((target) => !found.has(target));
    return next === undefined ? UNREACHABLE : (view.dist[row + next] ?? UNREACHABLE);
  }

  let best = UNREACHABLE;
  for (const target of hypothesis) {
    if (!found.has(target)) best = Math.min(best, view.dist[row + target] ?? UNREACHABLE);
  }
  return best;
};

const directionOf = (
  view: SolverView,
  found: ReadonlySet<Idx>,
  hypothesis: Hypothesis,
  cell: Idx,
) => {
  let best: { dir: Direction; value: number } | null = null;
  for (const { dir, idx } of view.neighbors[cell] ?? []) {
    const value = probeOf(view, found, hypothesis, idx);
    if (best === null || value < best.value) best = { dir, value };
  }
  return best?.dir ?? "N";
};

const compareOf = (value: number, previous: number | null): HotColdCompare => {
  if (previous === null) return "none";
  if (value < previous) return "warmer";
  if (value > previous) return "colder";
  return "same";
};

const enumerateConsistent = (view: SolverView, observations: readonly Observation[]) => {
  const kept: Hypothesis[] = [];
  forEachTuple(view.candidates, view.targetCount, view.targetOrder, (tuple) => {
    if (observations.every((observation) => observation(tuple))) kept.push([...tuple]);
  });
  return kept;
};

const capHypotheses = (view: SolverView, kept: Hypothesis[], round: number) => {
  if (kept.length <= MAX_FULL_SPACE) return kept;
  const rng = rngFromKey(`${view.levelId}#sample${round}`);
  return sampleIndices(kept.length, rng, SAMPLE_SIZE).map((index) => kept[index] ?? []);
};

const applyObservations = (state: SolverState, added: readonly Observation[]): SolverState => {
  const observations = [...state.observations, ...added];
  const filtered = state.hypotheses.filter((hypothesis) =>
    added.every((observation) => observation(hypothesis)),
  );
  if (filtered.length > 0) return { ...state, observations, hypotheses: filtered };
  if (!state.view.isSampled) throw new Error("No target hypothesis matches the observations");

  // The sample lost the true placement: rebuild from the full space (выборка потеряла истинную расстановку: пересобираем из полного пространства).
  const round = state.resampleRound + 1;
  const kept = enumerateConsistent(state.view, observations);
  if (kept.length === 0) throw new Error("No target hypothesis matches the observations");

  return {
    ...state,
    observations,
    hypotheses: capHypotheses(state.view, kept, round),
    resampleRound: round,
  };
};

const answerObservations = (state: SolverState, cell: Idx, game: GameState): Observation[] => {
  const reveal = game.revealed.get(cell);
  const { view } = state;
  const { found } = state;
  const notTarget: Observation = (hypothesis) => !hypothesis.includes(cell);
  if (reveal === undefined) return [notTarget];

  if (reveal.kind === "distance") {
    return [notTarget, (hypothesis) => probeOf(view, found, hypothesis, cell) === reveal.value];
  }
  if (reveal.kind === "direction") {
    return [notTarget, (hypothesis) => directionOf(view, found, hypothesis, cell) === reveal.dir];
  }
  if (reveal.kind === "hotcold") {
    const previous = state.prevAnswer;
    if (previous === null) return [notTarget];
    return [
      notTarget,
      (hypothesis) =>
        compareOf(
          probeOf(view, found, hypothesis, cell),
          probeOf(view, found, hypothesis, previous),
        ) === reveal.cmp,
    ];
  }

  return [notTarget];
};

const bombFlagOf = (game: GameState, cell: Idx) => {
  const reveal = game.revealed.get(cell);
  if (reveal === undefined || reveal.kind === "bomb") return null;
  return reveal.bombNear;
};

const withBombFlag = (state: SolverState, cell: Idx, game: GameState): SolverState => {
  const flag = bombFlagOf(game, cell);
  if (flag === null) return state;
  return { ...state, bombFlags: [...state.bombFlags, { cell, flag, time: state.time }] };
};

const markRevealed = (state: SolverState, cell: Idx): SolverState => ({
  ...state,
  revealed: new Set([...state.revealed, cell]),
});

const observeAnswer = (state: SolverState, cell: Idx, game: GameState): SolverState => {
  const observed = applyObservations(state, answerObservations(state, cell, game));
  return withBombFlag({ ...markRevealed(observed, cell), prevAnswer: cell }, cell, game);
};

const observeBomb = (state: SolverState, cell: Idx): SolverState => {
  const observed = applyObservations(state, [(hypothesis) => !hypothesis.includes(cell)]);
  return {
    ...markRevealed(observed, cell),
    exploded: new Map([...observed.exploded, [cell, observed.time]]),
  };
};

const observeTargetFound = (state: SolverState, cell: Idx, game: GameState): SolverState => {
  const reveal = game.revealed.get(cell);
  const order = reveal?.kind === "target" ? reveal.order : undefined;
  const isTarget: Observation =
    state.view.targetOrder && order !== undefined
      ? (hypothesis) => hypothesis[order - 1] === cell
      : (hypothesis) => hypothesis.includes(cell);
  const observed = applyObservations(state, [isTarget]);
  return withBombFlag(
    {
      ...markRevealed(observed, cell),
      found: new Set([...observed.found, cell]),
      prevAnswer: null,
    },
    cell,
    game,
  );
};

export const createSolver = (game: GameState, { levelId, penalty }: SolverOptions): SolverState => {
  const { board, rules } = game;
  const size = cellCount(board);
  const rocks = new Set(board.kinds.flatMap((kind, idx) => (kind === "rock" ? [idx] : [])));
  const beacons = new Set(board.beacons);
  const candidates = board.kinds.flatMap((kind, idx) =>
    kind === "rock" || beacons.has(idx) ? [] : [idx],
  );
  const targetCount = board.targets.length;
  const isSampled = spaceSize(candidates.length, targetCount, board.targetOrder) > MAX_FULL_SPACE;

  const view: SolverView = {
    levelId,
    penalty,
    size,
    rocks,
    dist: game.dist,
    neighbors: board.kinds.map((_, idx) => passableNeighbors(board, idx)),
    gridNeighbors: board.kinds.map((_, idx) =>
      gridNeighbors(board, idx).map((neighbor) => neighbor.idx),
    ),
    candidates,
    targetCount,
    bombCount: board.bombs.length,
    probeMode: game.variant === "pvp" ? "distance" : rules.probeMode,
    targetOrder: board.targetOrder,
    bombHint: rules.bombHint,
    isSampled,
  };

  const hypotheses = isSampled
    ? sampleTuples(
        candidates,
        targetCount,
        board.targetOrder,
        rngFromKey(`${levelId}#sample`),
        SAMPLE_SIZE,
      )
    : enumerateConsistent(view, []);

  const initial: SolverState = {
    view,
    hypotheses,
    found: new Set(),
    revealed: new Set(),
    prevAnswer: null,
    bombFlags: [],
    exploded: new Map(),
    time: 0,
    observations: [],
    resampleRound: 0,
  };

  return board.beacons.reduce(
    (state, beacon) => ({ ...observeAnswer(state, beacon, game), prevAnswer: null }),
    initial,
  );
};

export const observeTap = (
  state: SolverState,
  cell: Idx,
  events: readonly GameEvent[],
  game: GameState,
) => {
  let next: SolverState = { ...state, time: state.time + 1 };
  for (const event of events) {
    if (event.type === "bomb") next = observeBomb(next, cell);
    if (event.type === "targetFound") next = observeTargetFound(next, cell, game);
    if (event.type === "reveal" || event.type === "buoy") next = observeAnswer(next, cell, game);
  }
  return next;
};

export const bombProbabilities = (state: SolverState): Float64Array => {
  const { view } = state;
  const probabilities = new Float64Array(view.size);
  const remaining = view.bombCount - state.exploded.size;
  const candidates = Array.from({ length: view.size }, (_, idx) => idx).filter(
    (idx) => !view.rocks.has(idx) && !state.revealed.has(idx),
  );
  if (remaining <= 0 || candidates.length === 0) return probabilities;

  const constraints = view.bombHint ? state.bombFlags : [];
  const uniform = () => {
    candidates.forEach((idx) => {
      probabilities[idx] = remaining / candidates.length;
    });
    return probabilities;
  };
  if (constraints.length === 0) return uniform();

  const fits = (placement: readonly number[]) =>
    constraints.every(({ cell, flag, time }) => {
      const hasBomb = (view.gridNeighbors[cell] ?? []).some(
        (neighbor) => placement.includes(neighbor) || (state.exploded.get(neighbor) ?? -1) > time,
      );
      return hasBomb === flag;
    });

  const counts = new Float64Array(view.size);
  let total = 0;
  const count = (placement: readonly number[]) => {
    if (!fits(placement)) return;
    total += 1;
    placement.forEach((idx) => {
      counts[idx] = (counts[idx] ?? 0) + 1;
    });
  };

  if (binomial(candidates.length, remaining) <= MAX_FULL_SPACE) {
    forEachTuple(candidates, remaining, false, count);
  } else {
    const rng = rngFromKey(`${view.levelId}#bombs${state.time}`);
    sampleTuples(candidates, remaining, false, rng, SAMPLE_SIZE).forEach(count);
  }

  if (total === 0) return uniform();
  candidates.forEach((idx) => {
    probabilities[idx] = (counts[idx] ?? 0) / total;
  });
  return probabilities;
};

// Sums in ascending key order so floating-point results match Go, then clears the counters for the next cell (суммирует по возрастанию ключей, чтобы float совпадал с Go, и обнуляет счётчики).
const drainEntropy = (counts: Int32Array, touched: number[], total: number) => {
  touched.sort((a, b) => a - b);
  let weighted = 0;
  for (const slot of touched) {
    const occurrences = counts[slot] ?? 0;
    weighted += occurrences * Math.log2(occurrences);
    counts[slot] = 0;
  }
  touched.length = 0;
  return Math.log2(total) - weighted / total;
};

export interface CellScore {
  cell: Idx;
  score: number;
  targetShare: number;
}

// Hot loop over hypotheses × cells: flat typed arrays and inlined probes keep it fast on phones (горячий цикл по гипотезам × клеткам: плоские типизированные массивы и встроенный пеленг держат его быстрым на телефонах).
export const scoreCells = (state: SolverState): CellScore[] => {
  const { view, hypotheses } = state;
  const total = hypotheses.length;
  const k = view.targetCount;
  const size = view.size;
  const dist = view.dist;
  const flat = new Int16Array(total * k);
  hypotheses.forEach((hypothesis, index) => flat.set(hypothesis, index * k));
  const isFound = new Uint8Array(size);
  state.found.forEach((idx) => {
    isFound[idx] = 1;
  });

  const probe = (base: number, cell: number) => {
    const row = cell * size;
    let best = UNREACHABLE;
    for (let slot = 0; slot < k; slot += 1) {
      const target = flat[base + slot] ?? 0;
      if (isFound[target] === 1) continue;
      const value = dist[row + target] ?? UNREACHABLE;
      if (view.targetOrder) return value;
      if (value < best) best = value;
    }
    return best;
  };

  const bombs = bombProbabilities(state);
  const scores: CellScore[] = [];
  // Answer keys are small integers: TARGET_KEY, distances, or direction/compare indices (ключи ответов — небольшие целые числа).
  const counts = new Int32Array(NO_NEIGHBOR_VALUE + KEY_OFFSET);
  const touched: number[] = [];
  const previous = state.prevAnswer;

  for (let cell = 0; cell < size; cell += 1) {
    if (view.rocks.has(cell) || state.revealed.has(cell)) continue;
    const neighbors = view.neighbors[cell] ?? [];

    let targets = 0;
    for (let index = 0; index < total; index += 1) {
      const base = index * k;
      let isTarget = false;
      for (let slot = 0; slot < k; slot += 1) {
        if (flat[base + slot] === cell) isTarget = true;
      }

      let key: number;
      if (isTarget) {
        key = TARGET_KEY;
        targets += 1;
      } else if (view.probeMode === "direction") {
        let bestValue = NO_NEIGHBOR_VALUE;
        key = 0;
        for (const { dir, idx } of neighbors) {
          const value = probe(base, idx);
          if (value < bestValue) {
            bestValue = value;
            key = DIRECTION_INDEX[dir];
          }
        }
      } else if (view.probeMode === "hotcold") {
        const value = probe(base, cell);
        key = COMPARE_INDEX[compareOf(value, previous === null ? null : probe(base, previous))];
      } else {
        key = probe(base, cell);
      }

      const slot = key + KEY_OFFSET;
      if (counts[slot] === 0) touched.push(slot);
      counts[slot] = (counts[slot] ?? 0) + 1;
    }

    const entropy = drainEntropy(counts, touched, total);
    const targetShare = targets / total;
    scores.push({
      cell,
      targetShare,
      score: entropy + targetShare - (bombs[cell] ?? 0) * view.penalty,
    });
  }

  return scores;
};

interface ChooseOptions {
  mistakeChance?: number;
  scores?: readonly CellScore[];
}

export const chooseMove = (
  state: SolverState,
  rng: Rng,
  { mistakeChance = 0, scores = scoreCells(state) }: ChooseOptions = {},
): Idx => {
  if (scores.length === 0) throw new Error("No cell left to tap");

  if (mistakeChance > 0 && rng() < mistakeChance) {
    const possible = scores.filter(({ targetShare }) => targetShare > 0);
    return pick(rng, possible.length > 0 ? possible : scores).cell;
  }

  const certain = scores.find(({ targetShare }) => targetShare === 1);
  if (certain !== undefined) return certain.cell;

  const best = Math.max(...scores.map(({ score }) => score));
  const tied = scores.filter(({ score }) => score >= best - TIE_TOLERANCE);
  const [only] = tied;
  // A single best cell consumes no random draw, which keeps run sequences stable (единственная лучшая клетка не тратит случайное число — последовательности прогонов стабильны).
  if (tied.length === 1 && only !== undefined) return only.cell;

  return pick(rng, tied).cell;
};
