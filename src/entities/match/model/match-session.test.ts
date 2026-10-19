import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

import { apiClient, setApiSession } from "@shared/api";
import { fakeGameServer } from "@shared/api/mocks/fake-game/fake-game-server";
import { mockServer } from "@shared/test-utils/api-mock";

import { matchSession } from "./match-session";
import { useMatchStore } from "./match-store";

const MAP = {
  rows: 5,
  cols: 5,
  targets: [[2, 2]] as [number, number][],
  bombs: [[0, 0]] as [number, number][],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ] as [number, number][],
};
const OPPONENT_MAP = { rows: 5, cols: 5, targets: [[2, 2]] as [number, number][], bombs: [] };
const SEARCH_MS = 20_000;
const INTRO_MS = 3_000;

const saveActiveMap = async () => {
  const { data } = await apiClient.POST("/arena/maps", {
    body: { name: "Fort", format: 5, map: MAP },
  });
  const id = data?.id ?? "";
  await apiClient.POST("/arena/maps/{id}/activate", { params: { path: { id } } });
  return id;
};

const state = () => useMatchStore.getState();

const STEP_MS = 100;

const untilMyTurn = async () => {
  for (
    let elapsed = 0;
    elapsed < SEARCH_MS + INTRO_MS && state().phase !== "myTurn";
    elapsed += STEP_MS
  ) {
    await jest.advanceTimersByTimeAsync(STEP_MS);
  }
};

describe("matchSession", () => {
  beforeAll(() =>
    setApiSession({ getAccessToken: () => "access", refreshAccessToken: async () => "access" }),
  );

  afterEach(() => {
    matchSession.leave();
    jest.useRealTimers();
    mockServer.reset();
  });

  const startSearch = async () => {
    const mapId = await saveActiveMap();
    jest.useFakeTimers();
    fakeGameServer.configure({ opponentMap: OPPONENT_MAP, first: "me" });
    matchSession.search(5, mapId);
    return mapId;
  };

  test("searches, meets the opponent and starts on my turn (Part 8 §6.3)", async () => {
    await startSearch();
    expect(state().phase).toBe("searching");

    await untilMyTurn();

    expect(state()).toEqual(
      expect.objectContaining({ phase: "myTurn", turn: 1, current: "me", firstPlayer: "me" }),
    );
    expect(state().opponent?.isBot).toBe(false);
  });

  test("sends a tap and records the server's answer (PVP-01)", async () => {
    await startSearch();
    await untilMyTurn();

    matchSession.tap([2, 0]);
    expect(state().pendingCell).toEqual([2, 0]);
    await jest.advanceTimersByTimeAsync(10);

    expect(state().myTaps).toEqual([
      expect.objectContaining({ cell: [2, 0], outcome: "pelang", value: 2 }),
    ]);
    expect(state()).toEqual(expect.objectContaining({ phase: "opponentTurn", pendingCell: null }));
  });

  test("ends the match on surrender (PVP-15)", async () => {
    await startSearch();
    await untilMyTurn();

    matchSession.surrender();
    await jest.advanceTimersByTimeAsync(10);

    expect(state()).toEqual(
      expect.objectContaining({
        phase: "ended",
        end: expect.objectContaining({ result: "loss", reason: "surrender" }),
      }),
    );
  });

  test("stops the search when the app goes to the background (decision 0033 #6)", async () => {
    const listeners: ((status: AppStateStatus) => void)[] = [];
    jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      listeners.push(listener);
      return { remove: () => undefined };
    });
    matchSession.leave();
    await startSearch();

    listeners.forEach((listener) => listener("background"));

    expect(state().phase).toBe("stopped");
    jest.restoreAllMocks();
  });

  test("offers the running match when another search is refused (decision 0033 #4)", async () => {
    const mapId = await startSearch();
    await untilMyTurn();
    const { matchId } = state();
    matchSession.leave();

    matchSession.search(5, mapId);
    await jest.advanceTimersByTimeAsync(10);

    expect(state().inMatch).toEqual({ matchId, endpoint: expect.stringContaining(`/${matchId}`) });
  });

  test("returns to the running match with a snapshot", async () => {
    await startSearch();
    await untilMyTurn();
    matchSession.tap([2, 0]);
    await jest.advanceTimersByTimeAsync(10);
    const endpoint = `wss://game-1.mock.reckon-path.local/v1/match/${state().matchId ?? ""}`;
    matchSession.leave();

    matchSession.returnTo(endpoint);
    await jest.advanceTimersByTimeAsync(10);

    expect(state().myTaps).toHaveLength(1);
    expect(state().phase).not.toBe("idle");
  });
});
