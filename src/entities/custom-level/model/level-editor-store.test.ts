import { emptyDraft } from "./custom-level-of";
import { isDraftDirty, useLevelEditorStore } from "./level-editor-store";

const store = () => useLevelEditorStore.getState();
const DRAFT = emptyDraft("A", 5, 5, "distance");
const withTarget = { ...DRAFT.map, targets: [[2, 2]] as [number, number][] };

describe("useLevelEditorStore", () => {
  beforeEach(() => store().reset());

  test("keeps the open draft of the same level", () => {
    store().open("new", DRAFT, null);
    store().apply(withTarget);
    store().open("new", DRAFT, null);

    expect(store().session?.draft.map.targets).toEqual([[2, 2]]);
  });

  test("undoes and redoes map edits, a drag as one step", () => {
    store().open("new", DRAFT, null);
    store().beginStroke();
    store().strokeTo(withTarget);
    store().strokeTo({ ...withTarget, streams: [[0, 0]] });
    store().endStroke();

    store().undo();
    expect(store().session?.draft.map).toEqual(DRAFT.map);
    store().redo();
    expect(store().session?.draft.map.streams).toEqual([[0, 0]]);
  });

  test("changes the title and parameters and remembers the saved state", () => {
    store().open("new", DRAFT, null);
    store().apply(withTarget);
    store().setTitle("Бухта");
    store().setParams({ moveLimit: 9 });
    const session = store().session;
    expect(session === null ? false : isDraftDirty(session)).toBe(true);

    store().markSaved("custom-1", store().session?.draft ?? DRAFT);

    const saved = store().session;
    expect(saved?.levelId).toBe("custom-1");
    expect(saved === null ? true : isDraftDirty(saved)).toBe(false);
    expect(saved?.draft).toMatchObject({ title: "Бухта", params: { moveLimit: 9 } });
  });

  test("keeps a level deleted elsewhere as a new draft (decision 0063 #8)", () => {
    store().open("level-1", { ...DRAFT, map: withTarget }, { ...DRAFT, map: withTarget });

    store().forgetSaved();

    expect(store().session).toMatchObject({
      levelId: "new",
      saved: null,
      draft: { map: withTarget },
    });
  });

  test("drops a draft of the old dev mocks (decision 0063 #15)", () => {
    const { migrate } = useLevelEditorStore.persist.getOptions();
    const session = (levelId: string) => ({
      levelId,
      draft: DRAFT,
      saved: null,
      past: [],
      future: [],
    });

    expect(migrate?.({ session: session("custom-3") }, 1)).toEqual({ session: null });
    expect(migrate?.({ session: session("new") }, 1)).toEqual({ session: session("new") });
  });

  test("falls back to no session on corrupt data", () => {
    const { migrate } = useLevelEditorStore.persist.getOptions();

    expect(migrate?.({ session: { levelId: 5 } }, 0)).toEqual({ session: null });
  });
});
