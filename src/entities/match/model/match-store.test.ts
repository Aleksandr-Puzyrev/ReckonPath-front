import { matchViewMock } from "@shared/test-utils/api-mock";

import { useMatchStore } from "./match-store";

const store = () => useMatchStore.getState();
const NOW = Date.parse("2026-11-02T12:00:00Z");

describe("useMatchStore", () => {
  beforeEach(() => store().reset());

  test("keeps the newest view by seq and drops older or equal copies", () => {
    store().receive(matchViewMock({ seq: 5 }, NOW));
    store().receive(matchViewMock({ seq: 4, status: "done" }, NOW));
    store().receive(matchViewMock({ seq: 5, status: "done" }, NOW));

    expect(store().view?.seq).toBe(5);
    expect(store().view?.status).toBe("prepare");

    store().receive(matchViewMock({ seq: 6, status: "play" }, NOW));

    expect(store().view?.status).toBe("play");
  });

  test("measures the clock offset from the server time of the view", () => {
    store().receive(matchViewMock({}, NOW), NOW - 2000);

    expect(store().offsetMs).toBe(2000);
  });

  test("clears the search and the flags of another match", () => {
    store().receiveQueue({
      joinedAt: "2026-11-02T12:00:00Z",
      serverTime: "2026-11-02T12:00:00Z",
      mapOfferAt: "2026-11-02T12:00:10Z",
      botAt: "2026-11-02T12:00:20Z",
      format: matchViewMock().format,
    });
    store().toggleFlag([1, 1]);
    store().receive(matchViewMock({ id: "other" }, NOW));

    expect(store().queue).toBeNull();
    expect(store().flags).toEqual([]);
  });

  test("toggles flags and resets", () => {
    store().toggleFlag([1, 2]);
    store().toggleFlag([2, 2]);
    store().toggleFlag([1, 2]);

    expect(store().flags).toEqual([[2, 2]]);

    store().reset();

    expect(store().view).toBeNull();
  });
});
