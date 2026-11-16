import { create } from "zustand";

import type { Cell, MatchView, QueueView } from "./match-type";

interface MatchStore {
  view: MatchView | null;
  offsetMs: number;
  queue: QueueView | null;
  flags: Cell[];
  receive: (view: MatchView, receivedAt?: number) => void;
  receiveQueue: (queue: QueueView | null, receivedAt?: number) => void;
  receivePresence: (matchId: string, isOnline: boolean) => void;
  toggleFlag: (cell: Cell) => void;
  reset: () => void;
}

const INITIAL = { view: null, offsetMs: 0, queue: null, flags: [] };

const sameCell = ([a, b]: Cell, [c, d]: Cell) => a === c && b === d;

// The server sends the whole match every time; an older or equal seq is a late copy and is dropped (сервер каждый раз присылает матч целиком; меньший или равный seq — запоздавшая копия и отбрасывается).
export const useMatchStore = create<MatchStore>()((set, get) => ({
  ...INITIAL,

  receive: (view, receivedAt = Date.now()) => {
    const current = get().view;
    const isSame = current?.id === view.id;
    if (isSame && view.seq <= current.seq) return;
    set({
      view,
      queue: null,
      offsetMs: Date.parse(view.serverTime) - receivedAt,
      ...(isSame ? {} : { flags: [] }),
    });
  },

  receiveQueue: (queue, receivedAt = Date.now()) =>
    set(
      queue === null ? { queue } : { queue, offsetMs: Date.parse(queue.serverTime) - receivedAt },
    ),

  // Presence comes apart from the match and does not move its seq (присутствие приходит отдельно от матча и не меняет его seq).
  receivePresence: (matchId, isOnline) => {
    const { view } = get();
    if (view?.id === matchId) set({ view: { ...view, rivalOnline: isOnline } });
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
