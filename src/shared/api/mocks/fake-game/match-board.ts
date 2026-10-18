import { applyTap, createBoard, initGame, toIdx } from "@reckon-path/engine";
import type { GameEvent, GameState, Idx } from "@reckon-path/engine";

import type { components } from "../../generated/schema";

type PvpMap = components["schemas"]["PvpMap"];

export type TapOutcome = "pelang" | "target" | "bomb";

export interface BoardTap {
  game: GameState;
  events: GameEvent[];
  idx: Idx;
  outcome: TapOutcome;
  value: number | null;
  bombNear: boolean;
}

export type TapRefusal = "CELL_ROCK" | "CELL_REVEALED" | "OUTSIDE";

export const createMatchBoard = (map: PvpMap, bombHint: boolean) => {
  const { board, rules } = createBoard({
    ...map,
    v: 2,
    id: "u-arena-match",
    probeMode: "distance",
    bombHint,
  });
  return initGame(board, { ...rules, moveLimit: null }, { variant: "pvp" });
};

const outcomeOf = (game: GameState, idx: Idx, events: GameEvent[]) => {
  if (events.some(({ type }) => type === "bomb")) {
    return { outcome: "bomb" as const, value: null, bombNear: false };
  }
  const reveal = game.revealed.get(idx);
  if (reveal?.kind === "distance") {
    return { outcome: "pelang" as const, value: reveal.value, bombNear: reveal.bombNear };
  }
  return {
    outcome: "target" as const,
    value: null,
    bombNear: reveal?.kind === "target" && reveal.bombNear,
  };
};

export const tapBoard = (
  game: GameState,
  [row, col]: readonly [number, number],
): BoardTap | TapRefusal => {
  const { rows, cols, kinds } = game.board;
  if (row < 0 || col < 0 || row >= rows || col >= cols) return "OUTSIDE";
  const idx = toIdx(cols, [row, col]);
  if (kinds[idx] === "rock") return "CELL_ROCK";
  if (game.revealed.has(idx)) return "CELL_REVEALED";
  const { state, events } = applyTap(game, idx);
  return { game: state, events, idx, ...outcomeOf(state, idx, events) };
};
