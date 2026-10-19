import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

import type { PvpMap } from "./arena-map-type";
import { isMapEmpty } from "./map-edit";

const STORE_VERSION = 1;
export const HISTORY_STEPS = 30;

interface SavedMap {
  name: string;
  map: PvpMap;
}

export interface EditorSession {
  mapId: string;
  name: string;
  map: PvpMap;
  saved: SavedMap | null;
  past: PvpMap[];
  future: PvpMap[];
}

interface EditorState {
  session: EditorSession | null;
  strokeBase: PvpMap | null;
  open: (mapId: string, initial: SavedMap, saved: SavedMap | null) => void;
  apply: (map: PvpMap) => void;
  beginStroke: () => void;
  strokeTo: (map: PvpMap) => void;
  endStroke: () => void;
  undo: () => void;
  redo: () => void;
  rename: (name: string) => void;
  markSaved: (mapId: string) => void;
  reset: () => void;
}

const cellSchema = z.tuple([z.number().int(), z.number().int()]);
const cellsSchema = z.array(cellSchema).optional();
const mapSchema = z.object({
  rows: z.number().int(),
  cols: z.number().int(),
  targets: z.array(cellSchema),
  bombs: cellsSchema,
  streams: cellsSchema,
  bridges: cellsSchema,
  heavy: cellsSchema,
  rocks: cellsSchema,
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
});
const sessionSchema = z.object({
  mapId: z.string(),
  name: z.string(),
  map: mapSchema,
  saved: z.object({ name: z.string(), map: mapSchema }).nullable(),
  past: z.array(mapSchema),
  future: z.array(mapSchema),
});

const sameMap = (a: PvpMap, b: PvpMap) => JSON.stringify(a) === JSON.stringify(b);

export const isSessionDirty = ({ name, map, saved }: EditorSession) =>
  saved === null ? !isMapEmpty(map) : name !== saved.name || !sameMap(map, saved.map);

const pushed = (past: readonly PvpMap[], map: PvpMap) => [...past, map].slice(-HISTORY_STEPS);

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      const update = (change: (session: EditorSession) => Partial<EditorSession>) => {
        const { session } = get();
        if (session !== null) set({ session: { ...session, ...change(session) } });
      };

      return {
        session: null,
        strokeBase: null,

        open: (mapId, initial, saved) => {
          if (get().session?.mapId === mapId) return;
          set({ session: { mapId, ...initial, saved, past: [], future: [] }, strokeBase: null });
        },

        apply: (map) =>
          update((session) =>
            sameMap(map, session.map)
              ? {}
              : { map, past: pushed(session.past, session.map), future: [] },
          ),

        beginStroke: () => set({ strokeBase: get().session?.map ?? null }),

        strokeTo: (map) => update(() => ({ map })),

        // A whole drag is one history step (весь штрих пальцем — один шаг истории).
        endStroke: () => {
          const { strokeBase } = get();
          set({ strokeBase: null });
          if (strokeBase === null) return;
          update((session) =>
            sameMap(strokeBase, session.map)
              ? {}
              : { past: pushed(session.past, strokeBase), future: [] },
          );
        },

        undo: () =>
          update(({ past, future, map }) => {
            const previous = past.at(-1);
            return previous === undefined
              ? {}
              : { map: previous, past: past.slice(0, -1), future: [map, ...future] };
          }),

        redo: () =>
          update(({ past, future, map }) => {
            const [next, ...rest] = future;
            return next === undefined ? {} : { map: next, past: pushed(past, map), future: rest };
          }),

        rename: (name) => update(() => ({ name })),

        markSaved: (mapId) => update(({ name, map }) => ({ mapId, saved: { name, map } })),

        reset: () => set({ session: null, strokeBase: null }),
      };
    },
    {
      name: "editor",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ session }) => ({ session }),
      migrate: (persisted) => ({
        session: sessionSchema
          .nullable()
          .catch(null)
          .parse(
            typeof persisted === "object" && persisted !== null && "session" in persisted
              ? persisted.session
              : null,
          ),
      }),
    },
  ),
);
