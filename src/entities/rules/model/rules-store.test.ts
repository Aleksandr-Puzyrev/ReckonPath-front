import { unseenCards, useRulesStore } from "./rules-store";

const store = () => useRulesStore.getState();

describe("useRulesStore", () => {
  beforeEach(() => store().reset());

  test("remembers shown cards once", () => {
    store().markSeen(["beacon", "fence"]);
    store().markSeen(["beacon"]);
    expect(store().seenCards).toEqual(["beacon", "fence"]);
  });

  test("records the tutorial as finished or skipped", () => {
    expect(store().tutorial).toBe("pending");
    store().skipTutorial();
    expect(store().tutorial).toBe("skipped");
    store().finishTutorial();
    expect(store().tutorial).toBe("done");
  });

  test("remembers the move-limit hint", () => {
    store().markMovesHintSeen();
    expect(store().hasSeenMovesHint).toBe(true);
  });

  test("drops unknown cards and corrupt data on migration", () => {
    const { migrate } = useRulesStore.persist.getOptions();
    expect(
      migrate?.({ seenCards: ["beacon", "laser"], tutorial: "done", hasSeenMovesHint: true }, 0),
    ).toEqual({ seenCards: ["beacon"], tutorial: "done", hasSeenMovesHint: true });
    expect(migrate?.({ tutorial: 5 }, 0)).toEqual({
      seenCards: [],
      tutorial: "pending",
      hasSeenMovesHint: false,
    });
  });
});

describe("unseenCards", () => {
  test("keeps only the cards not shown yet, in order", () => {
    expect(unseenCards(["fence", "beacon", "flags"], ["beacon"])).toEqual(["fence", "flags"]);
  });
});
