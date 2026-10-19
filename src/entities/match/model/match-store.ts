import { create } from "zustand";

import type { ServerMessage } from "@shared/ws";

import { INITIAL_MATCH, receiveMatchMessage } from "./match-reducer";
import type { Cell, MatchState, SearchError } from "./match-reducer";

interface MatchStore extends MatchState {
  flags: Cell[];
  isReconnecting: boolean;
  receive: (message: ServerMessage) => void;
  startSearch: () => void;
  stopSearch: () => void;
  failSearch: (error: SearchError) => void;
  markLost: () => void;
  setPendingCell: (cell: Cell) => void;
  toggleFlag: (cell: Cell) => void;
  setReconnecting: (isReconnecting: boolean) => void;
  clearNotices: () => void;
  reset: () => void;
}

const sameCell = ([a, b]: Cell, [c, d]: Cell) => a === c && b === d;

const INITIAL = { ...INITIAL_MATCH, flags: [], isReconnecting: false };

export const useMatchStore = create<MatchStore>()((set, get) => ({
  ...INITIAL,

  receive: (message) => set(receiveMatchMessage(get(), message)),

  startSearch: () => set({ ...INITIAL, phase: "searching" }),

  stopSearch: () => set({ phase: "stopped" }),

  failSearch: (searchError) => set({ phase: "idle", searchError }),

  // A finished match keeps its result even if the socket closes afterwards (завершённый матч сохраняет итог, даже если сокет закрылся после него).
  markLost: () => {
    if (get().phase !== "ended") set({ phase: "lost", isReconnecting: false });
  },

  setPendingCell: (pendingCell) => set({ pendingCell }),

  toggleFlag: (cell) => {
    const { flags } = get();
    set({
      flags: flags.some((flag) => sameCell(flag, cell))
        ? flags.filter((flag) => !sameCell(flag, cell))
        : [...flags, cell],
    });
  },

  setReconnecting: (isReconnecting) => set({ isReconnecting }),

  clearNotices: () => set({ searchError: null, inMatch: null }),

  reset: () => set(INITIAL),
}));
