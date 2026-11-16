import { selectCampaignFlags, useCampaignFlagsStore } from "./campaign-flags-store";

const store = () => useCampaignFlagsStore.getState();

describe("useCampaignFlagsStore", () => {
  beforeEach(() => store().reset());

  test("toggles flags of one game", () => {
    store().toggle("game-1", 5);
    store().toggle("game-1", 6);
    store().toggle("game-1", 5);

    expect(selectCampaignFlags("game-1")(store())).toEqual([6]);
  });

  test("starts another game without the flags of the previous one", () => {
    store().toggle("game-1", 5);
    store().toggle("game-2", 7);

    expect(selectCampaignFlags("game-1")(store())).toEqual([]);
    expect(selectCampaignFlags("game-2")(store())).toEqual([7]);
  });

  test("removes the flag of an opened cell", () => {
    store().toggle("game-1", 5);
    store().remove("game-1", 5);

    expect(store().flags).toEqual([]);
  });

  test("forgets everything on reset", () => {
    store().toggle("game-1", 5);
    store().reset();

    expect(store()).toMatchObject({ gameId: null, flags: [] });
  });

  test("drops a broken saved shape", async () => {
    const migrate = useCampaignFlagsStore.persist.getOptions().migrate;

    expect(await migrate?.({ gameId: 3 }, 0)).toEqual({ gameId: null, flags: [] });
    expect(await migrate?.({ gameId: "g", flags: [1] }, 0)).toEqual({ gameId: "g", flags: [1] });
  });
});
