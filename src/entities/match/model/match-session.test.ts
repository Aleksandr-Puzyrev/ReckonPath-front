import type { ArenaEvent } from "@shared/ws";
import { matchViewMock } from "@shared/test-utils/api-mock";

import { createMatchSession } from "./match-session";
import type { MatchEventSource } from "./match-session";
import { useMatchStore } from "./match-store";

const createSource = () => {
  const events = new Set<(event: ArenaEvent) => void>();
  const reconnects = new Set<() => void>();
  const source: MatchEventSource & { isOpen: boolean } = {
    isOpen: false,
    open: () => {
      source.isOpen = true;
    },
    close: () => {
      source.isOpen = false;
    },
    onEvent: (listener) => {
      events.add(listener);
      return () => events.delete(listener);
    },
    onReconnect: (listener) => {
      reconnects.add(listener);
      return () => reconnects.delete(listener);
    },
  };
  return {
    source,
    push: (event: ArenaEvent) => events.forEach((listener) => listener(event)),
    reconnect: () => reconnects.forEach((listener) => listener()),
  };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("createMatchSession", () => {
  beforeEach(() => useMatchStore.getState().reset());

  test("keeps the socket open while any screen holds it", () => {
    const { source } = createSource();
    const session = createMatchSession(source, async () => null);

    const releaseHome = session.retain();
    const releaseMatch = session.retain();
    releaseHome();

    expect(source.isOpen).toBe(true);

    releaseMatch();

    expect(source.isOpen).toBe(false);
  });

  test("stores pushed matches by seq", () => {
    const { source, push } = createSource();
    const release = createMatchSession(source, async () => null).retain();

    push({ type: "match", time: "2026-11-02T12:00:00Z", match: matchViewMock({ seq: 3 }) });
    push({ type: "match", time: "2026-11-02T12:00:00Z", match: matchViewMock({ seq: 2 }) });

    expect(useMatchStore.getState().view?.seq).toBe(3);
    release();
  });

  test("marks the rival offline and back online by presence pushes of the current match", () => {
    const { source, push } = createSource();
    const release = createMatchSession(source, async () => null).retain();
    push({ type: "match", time: "2026-11-02T12:00:00Z", match: matchViewMock({ seq: 3 }) });

    push({
      type: "presence",
      time: "2026-11-02T12:00:01Z",
      presence: { matchId: "match-live", online: false },
    });
    expect(useMatchStore.getState().view?.rivalOnline).toBe(false);

    push({
      type: "presence",
      time: "2026-11-02T12:00:02Z",
      presence: { matchId: "match-other", online: true },
    });
    expect(useMatchStore.getState().view?.rivalOnline).toBe(false);
    release();
  });

  test("re-reads the current match after a reconnect", async () => {
    const { source, reconnect } = createSource();
    const current = matchViewMock({ seq: 9, status: "play" });
    const release = createMatchSession(source, async () => current).retain();

    reconnect();
    await flush();

    expect(useMatchStore.getState().view).toEqual(current);
    release();
  });

  test("stores the search state and loads the match the search found", async () => {
    const { source, push } = createSource();
    const found = matchViewMock();
    const release = createMatchSession(source, async () => found).retain();
    const queue = {
      joinedAt: "2026-11-02T12:00:00Z",
      serverTime: "2026-11-02T12:00:00Z",
      mapOfferAt: "2026-11-02T12:00:10Z",
      botAt: "2026-11-02T12:00:20Z",
      format: found.format,
    };

    push({ type: "queue", time: "2026-11-02T12:00:00Z", queue: { queue } });

    expect(useMatchStore.getState().queue).toEqual(queue);

    push({
      type: "queue",
      time: "2026-11-02T12:00:05Z",
      queue: { match: { id: found.id, kind: "duel", status: "prepare" } },
    });
    await flush();

    expect(useMatchStore.getState().view?.id).toBe(found.id);
    release();
  });
});
