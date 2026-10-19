import type { PvpMap } from "./arena-map-type";
import { HISTORY_STEPS, isSessionDirty, useEditorStore } from "./editor-store";
import { emptyMap } from "./map-edit";

const withTarget = (col: number): PvpMap => ({ ...emptyMap(5), targets: [[0, col]] });

const session = () => {
  const current = useEditorStore.getState().session;
  if (current === null) throw new Error("No session");
  return current;
};

const openNew = () =>
  useEditorStore.getState().open("new", { name: "Карта 1", map: emptyMap(5) }, null);

describe("useEditorStore", () => {
  afterEach(() => useEditorStore.getState().reset());

  test("undoes and redoes a change", () => {
    openNew();
    useEditorStore.getState().apply(withTarget(1));

    useEditorStore.getState().undo();
    expect(session().map).toEqual(emptyMap(5));
    useEditorStore.getState().redo();

    expect(session().map).toEqual(withTarget(1));
  });

  test("keeps the last 30 steps", () => {
    openNew();
    Array.from({ length: HISTORY_STEPS + 5 }, (_, index) =>
      useEditorStore
        .getState()
        .apply({ ...emptyMap(5), targets: [[index % 5, index % 4]], bombs: [[4, index]] }),
    );

    expect(session().past).toHaveLength(HISTORY_STEPS);
  });

  test("records a whole drag as one step", () => {
    openNew();
    const store = useEditorStore.getState();

    store.beginStroke();
    store.strokeTo(withTarget(1));
    store.strokeTo(withTarget(2));
    store.endStroke();

    expect(session().past).toEqual([emptyMap(5)]);
  });

  test("keeps the unsaved draft when the same map is opened again (decision 0032 #9)", () => {
    openNew();
    useEditorStore.getState().apply(withTarget(1));

    openNew();

    expect(session().map).toEqual(withTarget(1));
  });

  test("starts over for another map", () => {
    openNew();
    useEditorStore.getState().apply(withTarget(1));

    useEditorStore.getState().open(
      "map_2",
      { name: "Reef", map: withTarget(3) },
      {
        name: "Reef",
        map: withTarget(3),
      },
    );

    expect(session()).toEqual(expect.objectContaining({ mapId: "map_2", past: [] }));
  });

  test("tells unsaved changes and forgets them once saved", () => {
    openNew();
    expect(isSessionDirty(session())).toBe(false);
    useEditorStore.getState().apply(withTarget(1));
    expect(isSessionDirty(session())).toBe(true);

    useEditorStore.getState().markSaved("map_9");

    expect(isSessionDirty(session())).toBe(false);
    expect(session().mapId).toBe("map_9");
  });

  test("restores a valid persisted draft and drops a broken one", async () => {
    const { migrate } = useEditorStore.persist.getOptions();
    const draft = {
      mapId: "map_1",
      name: "Fort",
      map: emptyMap(5),
      saved: null,
      past: [],
      future: [],
    };

    expect(await migrate?.({ session: draft }, 0)).toEqual({ session: draft });
    expect(await migrate?.({ session: { mapId: 3 } }, 0)).toEqual({ session: null });
  });
});
