import { apiClient } from "../../api-client";
import { mockServer } from "../mock-server";

import { OPPONENT_MAP, connectPeer, startMatch, tap } from "./test-utils/fake-game-harness";

const TURN_MS = 5_300;
const BOT_MAX_THINK_MS = 4_000;

const arenaProfile = async () => (await apiClient.GET("/arena")).data?.profile;

describe("fake match room", () => {
  afterEach(() => {
    jest.useRealTimers();
    mockServer.reset();
  });

  test("shows the opponent map without targets and bombs (PVP-28)", async () => {
    const { match } = await startMatch();

    const state = match.last("match.state");
    expect(state?.d.opponentMap).toEqual({});
    expect(state?.d.opponentBombs).toBe(1);
    expect(JSON.stringify(match.messages)).not.toContain("[2,2]");
  });

  test("gives the turn 5 s plus 300 ms on a 5×5 field (PVP-30)", async () => {
    const { match } = await startMatch();

    const turn = match.last("match.turn");
    const introEndsAt = match.last("match.state")?.d.introEndsAt ?? "";
    expect(turn?.d).toEqual(expect.objectContaining({ turn: 1, player: "me" }));
    expect(Date.parse(turn?.d.deadline ?? "") - Date.parse(introEndsAt)).toBe(TURN_MS);
  });

  test("answers a tap with a bearing and passes the turn (PVP-01)", async () => {
    const { match } = await startMatch();

    tap(match, [2, 0]);

    expect(match.last("ack")).toEqual({ t: "ack", id: "tap" });
    expect(match.last("match.tapResult")?.d).toEqual({
      turn: 1,
      player: "me",
      cell: [2, 0],
      outcome: "pelang",
      value: 2,
      bombNear: false,
      found: { me: 0, opponent: 0 },
    });
    expect(match.last("match.turn")?.d).toEqual(
      expect.objectContaining({ turn: 2, player: "opponent" }),
    );
  });

  test("lets the opponent play on its turn", async () => {
    const { match } = await startMatch({ first: "opponent" });

    await jest.advanceTimersByTimeAsync(BOT_MAX_THINK_MS);

    expect(match.last("match.tapResult")?.d.player).toBe("opponent");
  });

  test("refuses a tap on the opponent's turn (PVP-02)", async () => {
    const { match } = await startMatch({ first: "opponent" });

    tap(match, [2, 0]);

    expect(match.last("error")).toEqual({ t: "error", id: "tap", d: { code: "NOT_YOUR_TURN" } });
  });

  test("refuses a rock and a revealed cell", async () => {
    const { match } = await startMatch({ opponentMap: { ...OPPONENT_MAP, rocks: [[1, 1]] } });

    tap(match, [1, 1], "rock");
    tap(match, [2, 0]);
    await jest.advanceTimersByTimeAsync(BOT_MAX_THINK_MS);
    tap(match, [2, 0], "again");

    expect(match.of("error").map(({ id, d }) => [id, d.code])).toEqual([
      ["rock", "CELL_ROCK"],
      ["again", "CELL_REVEALED"],
    ]);
  });

  test("accepts a tap 5.2 s into the turn (PVP-08)", async () => {
    const { match } = await startMatch();

    await jest.advanceTimersByTimeAsync(5_200);
    tap(match, [2, 0]);

    expect(match.last("match.tapResult")?.d.player).toBe("me");
  });

  test("refuses a tap after the deadline (PVP-08)", async () => {
    const { match } = await startMatch();

    await jest.advanceTimersByTimeAsync(5_400);
    match.send({ t: "match.tap", id: "late", d: { turn: 1, cell: [2, 0] } });

    expect(match.last("error")).toEqual({ t: "error", id: "late", d: { code: "STALE_TURN" } });
  });

  test("gives the opponent two turns after my bomb (PVP-03)", async () => {
    const { match } = await startMatch();

    tap(match, [0, 0]);

    expect(match.last("match.tapResult")?.d).toEqual(
      expect.objectContaining({ outcome: "bomb", player: "me" }),
    );
    await jest.advanceTimersByTimeAsync(BOT_MAX_THINK_MS);
    expect(match.last("match.turn")?.d).toEqual(
      expect.objectContaining({ player: "opponent", skipped: [{ player: "me", reason: "bomb" }] }),
    );
  });

  test("passes the turn on a timeout and ends with afk after three (PVP-05, PVP-06)", async () => {
    const { match } = await startMatch();

    await jest.advanceTimersByTimeAsync(TURN_MS);
    expect(match.last("match.turn")?.d.skipped).toEqual([{ player: "me", reason: "timeout" }]);

    await jest.advanceTimersByTimeAsync(4 * TURN_MS);

    expect(match.last("match.end")?.d).toEqual(
      expect.objectContaining({ result: "loss", reason: "afk" }),
    );
  });

  test("gives the second player a final turn after the first finds all targets (PVP-09)", async () => {
    const { match } = await startMatch();

    tap(match, [2, 2]);

    expect(match.last("match.tapResult")?.d.outcome).toBe("target");
    expect(match.last("match.turn")?.d).toEqual(
      expect.objectContaining({ player: "opponent", final: true }),
    );
    await jest.advanceTimersByTimeAsync(TURN_MS);
    expect(match.last("match.end")?.d.reason).toBe("targets");
  });

  test("records a win with trophies, coins and emeralds (PVP-22, PVP-25)", async () => {
    const { match } = await startMatch({ first: "opponent" });
    await jest.advanceTimersByTimeAsync(TURN_MS);
    const { emeralds, coins } = (await apiClient.GET("/me")).data?.wallet ?? {};

    tap(match, [2, 2]);

    const end = match.last("match.end")?.d;
    expect(end?.result).toBe("win");
    expect(end?.rewards).toEqual([
      { currency: "coin", amount: 40 },
      { currency: "emerald", amount: 3 },
      { xp: 10 },
    ]);
    expect(end?.maps.opponent).toEqual({ targets: [[2, 2]], bombs: [[0, 0]] });
    expect((await apiClient.GET("/me")).data?.wallet).toEqual({
      emeralds: (emeralds ?? 0) + 3,
      coins: (coins ?? 0) + 40,
    });
    expect(await arenaProfile()).toEqual(
      expect.objectContaining({ trophies: end?.trophies.after, wins: 1 }),
    );
  });

  test("records a surrender as a loss in the history (PVP-15, PVP-23)", async () => {
    const { match, found } = await startMatch();

    match.send({ t: "match.surrender", id: "give-up" });

    const end = match.last("match.end")?.d;
    expect(end).toEqual(expect.objectContaining({ result: "loss", reason: "surrender", rp: 3 }));
    expect(end?.trophies).toEqual({ before: 0, after: 0, delta: 0 });
    const { data } = await apiClient.GET("/arena/matches");
    expect(data?.items).toEqual([
      expect.objectContaining({ matchId: found.d.matchId, mode: "ranked", result: "loss" }),
    ]);
  });

  test("halves the reward against the bot and labels it (PVP-31)", async () => {
    const { match } = await startMatch({ hasOpponent: false });

    match.send({ t: "match.surrender", id: "give-up" });

    expect(match.last("match.end")?.d.rp).toBe(2);
    const { data } = await apiClient.GET("/arena/matches");
    expect(data?.items[0]).toEqual(
      expect.objectContaining({
        mode: "bot",
        opponent: expect.objectContaining({ isBot: true, label: "training" }),
      }),
    );
  });

  test("echoes an emote and ignores a second one within 5 s (PVP-27)", async () => {
    const { match } = await startMatch();

    match.send({ t: "match.emote", d: { emote: "nice" } });
    await jest.advanceTimersByTimeAsync(3_000);
    match.send({ t: "match.emote", d: { emote: "wow" } });

    expect(match.of("match.emote")).toEqual([
      { t: "match.emote", d: { player: "me", emote: "nice" } },
    ]);
  });

  test("restores the match from a snapshot after a reconnect (PVP-16, NET-11)", async () => {
    const { match, found } = await startMatch();
    tap(match, [2, 0]);
    match.disconnect();

    const back = connectPeer(`${found.d.endpoint}?token=t&resume=1`);

    const snapshot = back.last("match.snapshot")?.d;
    expect(snapshot).toEqual(
      expect.objectContaining({ state: "playing", turn: 2, current: "opponent" }),
    );
    expect(snapshot?.myTaps).toEqual([
      { turn: 1, player: "me", cell: [2, 0], outcome: "pelang", value: 2, bombNear: false },
    ]);
  });

  test("answers a resync with a snapshot", async () => {
    const { match } = await startMatch();

    match.send({ t: "match.resync", id: "resync" });

    expect(match.last("match.snapshot")?.seq).toBeGreaterThan(match.last("match.turn")?.seq ?? 0);
  });
});
