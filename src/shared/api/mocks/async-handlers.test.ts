import { apiClient } from "../api-client";

import { setMockAsyncMap } from "./async-handlers";
import { mockServer } from "./mock-server";

const MAP = {
  rows: 5,
  cols: 5,
  targets: [[4, 4]] as [number, number][],
  bombs: [[0, 4]] as [number, number][],
};
const NORM = 3;
const TURN_MS = 5_300;

const start = async () => {
  const { data } = await apiClient.POST("/arena/async");
  return data?.asyncId ?? "";
};

const tap = async (id: string, cell: [number, number], turn = 1) =>
  (
    await apiClient.POST("/arena/async/{id}/tap", {
      params: { path: { id } },
      body: { turn, cell },
    })
  ).data;

const finishAfter = async (taps: [number, number][]) => {
  const id = await start();
  let answer: Awaited<ReturnType<typeof tap>> | undefined;
  for (const cell of taps) answer = await tap(id, cell);
  return answer;
};

describe("async mock", () => {
  beforeEach(() => setMockAsyncMap(MAP, NORM));

  afterEach(() => {
    jest.useRealTimers();
    mockServer.reset();
  });

  test("gives another player's layout without targets and bombs (ARN-11)", async () => {
    const { data } = await apiClient.POST("/arena/async");

    expect(data).toEqual(
      expect.objectContaining({ norm: NORM, bombCount: 1, targetsCount: 1, turnSec: 5 }),
    );
    expect(JSON.stringify(data?.map)).not.toContain("[4,4]");
    expect(data?.deadline).toEqual(expect.any(String));
  });

  test("answers a tap with a bearing and the turns used", async () => {
    const id = await start();

    expect(await tap(id, [0, 0])).toEqual(
      expect.objectContaining({ outcome: "pelang", value: 8, turnsUsed: 1 }),
    );
  });

  test.each([
    [
      [
        [0, 0],
        [4, 4],
      ],
      "win",
    ],
    [
      [
        [0, 0],
        [1, 1],
        [4, 4],
      ],
      "draw",
    ],
    [
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [4, 4],
      ],
      "loss",
    ],
  ] as const)("compares the turns with the norm (ARN-12): %j → %s", async (taps, result) => {
    const answer = await finishAfter(taps.map(([row, col]): [number, number] => [row, col]));

    expect(answer).toEqual(
      expect.objectContaining({
        finished: true,
        result,
        norm: NORM,
        map: { targets: MAP.targets, bombs: MAP.bombs },
      }),
    );
  });

  test("counts a bomb as one turn more (decision 0036 #6)", async () => {
    const id = await start();

    expect(await tap(id, [0, 4])).toEqual(
      expect.objectContaining({ outcome: "bomb", turnsUsed: 2 }),
    );
  });

  test("adds the turns missed after the deadline", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const id = await start();

    jest.setSystemTime(Date.now() + TURN_MS + 100);

    expect(await tap(id, [0, 0])).toEqual(expect.objectContaining({ turnsUsed: 2 }));
  });

  test("ends a surrendered match as a loss and records it in the history", async () => {
    const id = await start();

    const { data } = await apiClient.POST("/arena/async/{id}/surrender", {
      params: { path: { id } },
    });

    expect(data).toEqual(expect.objectContaining({ finished: true, result: "loss" }));
    const history = await apiClient.GET("/arena/matches");
    expect(history.data?.items[0]).toEqual(
      expect.objectContaining({ mode: "async", result: "loss" }),
    );
  });

  test("pays half the coins for an async win (decision 0036 #2)", async () => {
    const answer = await finishAfter([[4, 4]]);

    expect(answer).toEqual(
      expect.objectContaining({ rewards: [{ currency: "coin", amount: 20 }, { xp: 10 }] }),
    );
  });
});
