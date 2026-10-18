import { mockServer } from "../mock-server";

import { fakeGameServer } from "./fake-game-server";
import {
  ENTRY_URL,
  connectPeer,
  joinQueue,
  saveActiveMap,
  startMatch,
} from "./test-utils/fake-game-harness";

describe("fakeGameServer queue", () => {
  afterEach(() => {
    jest.useRealTimers();
    mockServer.reset();
  });

  const searchWith = async (hasOpponent: boolean) => {
    const mapId = await saveActiveMap();
    jest.useFakeTimers();
    fakeGameServer.configure({ hasOpponent });
    const entry = connectPeer(ENTRY_URL);
    joinQueue(entry, mapId);
    return entry;
  };

  test("finds a player within 3–8 s in the league format (decision 0030 #1)", async () => {
    const entry = await searchWith(true);

    await jest.advanceTimersByTimeAsync(2_999);
    expect(entry.of("match.found")).toHaveLength(0);
    await jest.advanceTimersByTimeAsync(5_001);

    const found = entry.last("match.found");
    expect(entry.of("ack")).toEqual([{ t: "ack", id: "join" }]);
    expect(found?.d.opponent).toEqual(expect.objectContaining({ isBot: false, label: null }));
    expect(found?.d.format).toEqual({
      size: 5,
      targets: 1,
      turnSec: 5,
      bombHint: true,
      maxTurns: 40,
    });
  });

  test("widens the range every 5 s and offers the async match after 10 s (Part 1 §5.3)", async () => {
    const entry = await searchWith(false);

    await jest.advanceTimersByTimeAsync(10_000);

    const statuses = entry.of("queue.status").map(({ d }) => d);
    expect(statuses[0]).toEqual({ waitedSec: 0, range: 100, asyncAvailable: false });
    expect(statuses[5]).toEqual({ waitedSec: 5, range: 150, asyncAvailable: false });
    expect(statuses[10]).toEqual({ waitedSec: 10, range: 200, asyncAvailable: true });
  });

  test("starts a bot match after 20 s without an opponent (PVP-31)", async () => {
    const entry = await searchWith(false);

    await jest.advanceTimersByTimeAsync(20_000);

    expect(entry.last("match.found")?.d.opponent).toEqual(
      expect.objectContaining({ isBot: true, label: "training", nickname: "Calm" }),
    );
  });

  test("stops the search on queue.leave", async () => {
    const entry = await searchWith(true);

    entry.send({ t: "queue.leave", id: "leave" });
    await jest.advanceTimersByTimeAsync(20_000);

    expect(entry.of("match.found")).toHaveLength(0);
    expect(entry.last("ack")).toEqual({ t: "ack", id: "leave" });
  });

  test("refuses a map that is missing or invalid", async () => {
    const entry = connectPeer(ENTRY_URL);

    joinQueue(entry, "unknown");

    expect(entry.last("error")).toEqual({ t: "error", id: "join", d: { code: "MAP_INVALID" } });
  });

  test("refuses a second ticket", async () => {
    const entry = await searchWith(true);

    joinQueue(entry, "any", "again");

    expect(entry.last("error")?.d.code).toBe("ALREADY_QUEUED");
  });

  test("refuses the search during a match (Part 1 §5.5)", async () => {
    const { entry, mapId } = await startMatch();

    joinQueue(entry, mapId, "again");

    expect(entry.last("error")?.d.code).toBe("IN_MATCH");
  });

  test("answers a ping with the server time", async () => {
    jest.useFakeTimers({ now: 5_000 });
    const entry = connectPeer(ENTRY_URL);

    entry.send({ t: "ping", d: { c: 4_900 } });

    expect(entry.last("pong")).toEqual({ t: "pong", d: { c: 4_900, s: 5_000 } });
  });
});
