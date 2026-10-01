import type { LevelInput } from "@reckon-path/engine";

import { selectHasSavedSession, useGameSessionStore } from "./game-session-store";

const LEVEL: LevelInput = {
  v: 2,
  id: "c-store",
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  bombs: [[0, 3]],
  probeMode: "distance",
  moveLimit: 4,
  stars: [2, 3],
};

const store = () => useGameSessionStore.getState();

describe("useGameSessionStore", () => {
  beforeEach(() => store().reset());

  test("starts a new game with an empty log", () => {
    store().start(LEVEL, "new");
    expect(store()).toMatchObject({ levelId: "c-store", actions: [], flags: [] });
    expect(store().game?.status).toBe("playing");
  });

  test("logs a tap that changes the game", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    expect(store().actions).toEqual([{ type: "tap", cell: 0 }]);
    expect(store().game?.movesUsed).toBe(1);
  });

  test("does not log a tap on an opened cell", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    const events = store().tap(0);
    expect(events).toEqual([{ type: "alreadyRevealed", cell: 0 }]);
    expect(store().actions).toHaveLength(1);
  });

  test("toggles a flag without spending a move", () => {
    store().start(LEVEL, "new");
    store().toggleFlag(5);
    expect(store().flags).toEqual([5]);
    expect(store().game?.movesUsed).toBe(0);
    store().toggleFlag(5);
    expect(store().flags).toEqual([]);
  });

  test("opens a flagged cell on tap and drops its flag", () => {
    store().start(LEVEL, "new");
    store().toggleFlag(5);
    store().tap(5);
    expect(store().flags).toEqual([]);
    expect(store().game?.revealed.has(5)).toBe(true);
  });

  test("never flags an opened cell", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    store().toggleFlag(0);
    expect(store().flags).toEqual([]);
  });

  test("continues a lost game once with three extra moves", () => {
    store().start(LEVEL, "new");
    [0, 1, 2, 4].forEach((cell) => store().tap(cell));
    expect(store().game?.status).toBe("lost");

    store().continueGame();
    expect(store().game).toMatchObject({ status: "playing", bonusMoves: 3, continued: true });
    expect(store().actions.at(-1)).toEqual({ type: "continue" });
  });

  test("restores the exact game from the saved log", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    store().tap(3);
    store().toggleFlag(6);
    const before = store().game;

    store().start(LEVEL, "resume");
    expect(store().game?.movesUsed).toBe(before?.movesUsed);
    expect([...(store().game?.revealed.keys() ?? [])]).toEqual([0, 3]);
    expect(store().flags).toEqual([6]);
  });

  test("reports a saved session only for its level with moves", () => {
    store().start(LEVEL, "new");
    expect(selectHasSavedSession("c-store")(store())).toBe(false);
    store().tap(0);
    expect(selectHasSavedSession("c-store")(store())).toBe(true);
    expect(selectHasSavedSession("c-other")(store())).toBe(false);
  });

  test("forgets the saved session when the game is finished", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    store().finish();
    expect(store()).toMatchObject({ levelId: null, actions: [], flags: [] });
  });
});

describe("useGameSessionStore persistence", () => {
  const { migrate } = useGameSessionStore.persist.getOptions();

  test("keeps a valid saved session on migration", () => {
    const saved = { levelId: "c-1", actions: [{ type: "tap", cell: 2 }], flags: [1] };
    expect(migrate?.(saved, 0)).toEqual(saved);
  });

  test("drops a corrupt saved session on migration", () => {
    expect(migrate?.({ levelId: 5 }, 0)).toEqual({ levelId: null, actions: [], flags: [] });
  });

  test("persists only the level, the action log, and the flags", () => {
    store().start(LEVEL, "new");
    store().tap(0);
    const { partialize } = useGameSessionStore.persist.getOptions();
    expect(partialize?.(store())).toEqual({
      levelId: "c-store",
      actions: [{ type: "tap", cell: 0 }],
      flags: [],
    });
  });
});
