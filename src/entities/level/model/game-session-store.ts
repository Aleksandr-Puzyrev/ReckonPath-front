import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GameEvent, GameState, Idx, LevelInput } from "@reckon-path/engine";
import { applyTap, canContinue, continueGame } from "@reckon-path/engine";

import { zustandStorage } from "@shared/storage";

import { replaySession, startGame } from "./replay-session";
import type { SessionAction } from "./replay-session";

const STORE_VERSION = 1;
const NO_STATE_CHANGE: ReadonlySet<GameEvent["type"]> = new Set(["blocked", "alreadyRevealed"]);

interface SavedSession {
  levelId: string | null;
  actions: SessionAction[];
  flags: Idx[];
}

interface GameSessionState extends SavedSession {
  game: GameState | null;
  start: (level: LevelInput, mode: "new" | "resume") => void;
  tap: (cell: Idx) => GameEvent[];
  toggleFlag: (cell: Idx) => void;
  continueGame: () => void;
  finish: () => void;
  reset: () => void;
}

const EMPTY_SESSION: SavedSession = { levelId: null, actions: [], flags: [] };

const savedSessionSchema = z.object({
  levelId: z.string().nullable(),
  actions: z.array(
    z.union([
      z.object({ type: z.literal("tap"), cell: z.number().int() }),
      z.object({ type: z.literal("continue") }),
    ]),
  ),
  flags: z.array(z.number().int()),
});

export const useGameSessionStore = create<GameSessionState>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      game: null,

      start: (level, mode) => {
        const { levelId, actions, flags } = get();
        if (mode === "resume" && levelId === level.id) {
          set({ game: replaySession(level, actions), flags });
          return;
        }
        set({ levelId: level.id, actions: [], flags: [], game: startGame(level) });
      },

      tap: (cell) => {
        const { game, actions, flags } = get();
        if (game === null) return [];

        const { state, events } = applyTap(game, cell);
        if (events.every(({ type }) => NO_STATE_CHANGE.has(type))) return events;

        set({
          game: state,
          actions: [...actions, { type: "tap", cell }],
          flags: flags.filter((flag) => flag !== cell),
        });
        return events;
      },

      toggleFlag: (cell) => {
        const { game, flags } = get();
        if (game === null || game.status !== "playing" || game.revealed.has(cell)) return;
        if (game.board.kinds[cell] === "rock") return;

        set({
          flags: flags.includes(cell) ? flags.filter((flag) => flag !== cell) : [...flags, cell],
        });
      },

      continueGame: () => {
        const { game, actions } = get();
        if (game === null || !canContinue(game)) return;
        set({ game: continueGame(game), actions: [...actions, { type: "continue" }] });
      },

      finish: () => set(EMPTY_SESSION),

      reset: () => set({ ...EMPTY_SESSION, game: null }),
    }),
    {
      name: "game-session",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ levelId, actions, flags }): SavedSession => ({ levelId, actions, flags }),
      migrate: (persisted) => savedSessionSchema.catch(EMPTY_SESSION).parse(persisted),
    },
  ),
);

export const selectHasSavedSession = (levelId: string) => (state: GameSessionState) =>
  state.levelId === levelId && state.actions.length > 0;
