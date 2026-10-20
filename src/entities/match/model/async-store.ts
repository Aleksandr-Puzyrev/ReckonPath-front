import { create } from "zustand";

import type { AsyncFinish, AsyncMatch, AsyncTapResult, Cell } from "./async-type";

export interface AsyncTap {
  cell: Cell;
  outcome: "pelang" | "target" | "bomb";
  value: number | null;
  bombNear: boolean;
}

interface AsyncState {
  match: AsyncMatch | null;
  trophiesBefore: number;
  turnsUsed: number;
  deadline: number | null;
  taps: AsyncTap[];
  flags: Cell[];
  pendingCell: Cell | null;
  finish: AsyncFinish | null;
  start: (match: AsyncMatch, trophiesBefore: number) => void;
  setPendingCell: (cell: Cell | null) => void;
  receiveTap: (cell: Cell, answer: AsyncTapResult) => void;
  receiveFinish: (finish: AsyncFinish, cell: Cell | null) => void;
  toggleFlag: (cell: Cell) => void;
  reset: () => void;
}

const sameCell = ([a, b]: readonly number[], [c, d]: readonly number[]) => a === c && b === d;

const INITIAL = {
  match: null,
  trophiesBefore: 0,
  turnsUsed: 0,
  deadline: null,
  taps: [],
  flags: [],
  pendingCell: null,
  finish: null,
};

export const useAsyncMatchStore = create<AsyncState>()((set, get) => ({
  ...INITIAL,

  start: (match, trophiesBefore) =>
    set({
      ...INITIAL,
      match,
      trophiesBefore,
      deadline: match.deadline === undefined ? null : Date.parse(match.deadline),
    }),

  setPendingCell: (pendingCell) => set({ pendingCell }),

  receiveTap: (cell, { outcome, value, bombNear, turnsUsed, deadline }) =>
    set({
      taps: [...get().taps, { cell, outcome, value: value ?? null, bombNear: bombNear ?? false }],
      turnsUsed,
      deadline: Date.parse(deadline),
      pendingCell: null,
    }),

  // The final answer hides the last tap; a tap on a target is shown as found (финальный ответ скрывает последний тап; тап по цели показывается найденной целью).
  receiveFinish: (finish, cell) => {
    const isTarget = cell !== null && finish.map.targets.some((target) => sameCell(target, cell));
    const last: AsyncTap[] =
      cell === null || !isTarget ? [] : [{ cell, outcome: "target", value: null, bombNear: false }];
    set({ finish, turnsUsed: finish.turnsUsed, taps: [...get().taps, ...last], pendingCell: null });
  },

  toggleFlag: (cell) => {
    const { flags } = get();
    set({
      flags: flags.some((flag) => sameCell(flag, cell))
        ? flags.filter((flag) => !sameCell(flag, cell))
        : [...flags, cell],
    });
  },

  reset: () => set(INITIAL),
}));
