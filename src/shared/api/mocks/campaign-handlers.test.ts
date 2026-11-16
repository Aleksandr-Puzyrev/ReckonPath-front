import { apiClient } from "../api-client";

import { mockOverview, passMockLevels } from "./mock-campaign";
import { mockServer } from "./mock-server";

const play = (number: number, restart = false) =>
  apiClient.POST("/campaign/levels/{number}/play", {
    params: { path: { number } },
    body: restart ? { restart: true } : {},
  });

const tap = (id: string, row: number, col: number, seq: number) =>
  apiClient.POST("/campaign/games/{id}/tap", {
    params: { path: { id } },
    body: { row, col, seq },
  });

const firstLevelGame = async () => (await play(1)).data;

describe("campaign mocks", () => {
  afterEach(() => mockServer.reset());

  test("plays the bundled level 1 with the engine and wins it", async () => {
    const game = await firstLevelGame();
    expect(game).toMatchObject({ level: 1, seq: 0, status: "play", board: { rows: 4, cols: 4 } });

    const answer = await tap(game?.id ?? "", 2, 1, 0);
    expect(answer.data?.cell).toMatchObject({ kind: "number", value: 2, epoch: 0 });

    const win = await tap(game?.id ?? "", 1, 2, 1);
    expect(win.data?.game).toMatchObject({ status: "won", found: 1 });
    expect(win.data?.game.result).toMatchObject({
      stars: 3,
      reward: 50,
      xp: 10,
      nextLevel: 2,
      secrets: { targets: [[1, 2]] },
    });
    expect(mockOverview("ru")).toMatchObject({ currentLevel: 2, stars: 3, levelsDone: 1 });
  });

  test("returns the unfinished game and starts over on restart", async () => {
    const game = await firstLevelGame();
    await tap(game?.id ?? "", 0, 0, 0);

    expect((await play(1)).data).toMatchObject({ id: game?.id, seq: 1 });
    expect((await play(1, true)).data).toMatchObject({ seq: 0 });
  });

  test("answers a repeated tap with the current game (stale_game)", async () => {
    const game = await firstLevelGame();
    await tap(game?.id ?? "", 0, 0, 0);

    const repeated = await tap(game?.id ?? "", 0, 1, 0);

    expect(repeated.response.status).toBe(409);
    expect(repeated.error).toMatchObject({ error: { code: "stale_game", details: { seq: 1 } } });
  });

  test("refuses an opened cell and a locked level", async () => {
    const game = await firstLevelGame();
    await tap(game?.id ?? "", 0, 0, 0);

    expect((await tap(game?.id ?? "", 0, 0, 1)).error).toMatchObject({
      error: { code: "cell_open" },
    });
    expect((await play(3)).error).toMatchObject({ error: { code: "level_locked" } });
  });

  test("continues a lost game for gems once and shows the secrets on giving up", async () => {
    passMockLevels(1);
    const game = (await play(2)).data;
    const id = game?.id ?? "";
    const cells: [number, number][] = [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [1, 1],
    ];
    for (const [index, [row, col]] of cells.entries()) await tap(id, row, col, index);

    const continued = await apiClient.POST("/campaign/games/{id}/continue", {
      params: { path: { id } },
      body: { seq: cells.length },
    });
    expect(continued.data).toMatchObject({ status: "play", limit: 9, continues: 1 });

    const more: [number, number][] = [
      [3, 0],
      [3, 1],
      [3, 2],
    ];
    for (const [index, [row, col]] of more.entries()) await tap(id, row, col, cells.length + index);
    const lost = await apiClient.GET("/campaign/games/{id}", { params: { path: { id } } });
    expect(lost.data?.result).toMatchObject({ canContinue: false });

    const given = await apiClient.POST("/campaign/games/{id}/give-up", {
      params: { path: { id } },
    });
    expect(given.data).toMatchObject({
      status: "abandoned",
      result: { secrets: { targets: [[2, 3]] } },
    });
  });

  test("keeps the tutorials the levels name and the app's hints, and refuses the rest", async () => {
    const known = await apiClient.POST("/campaign/tutorials", { body: { key: "tut_first_level" } });
    const hint = await apiClient.POST("/campaign/tutorials", { body: { key: "home_tour" } });
    const unknown = await apiClient.POST("/campaign/tutorials", { body: { key: "lighthouse" } });

    expect(known.response.ok).toBe(true);
    expect(hint.response.ok).toBe(true);
    expect(unknown.response.status).toBe(422);
    expect(mockOverview("ru").tutorials).toEqual(["tut_first_level", "home_tour"]);
  });

  test("opens the daily after level 6 and the arena after level 12", () => {
    passMockLevels(6);
    expect(mockOverview("ru").unlocks).toMatchObject({ daily: true, arena: false });

    passMockLevels(12);
    expect(mockOverview("ru").unlocks).toMatchObject({ daily: true, arena: true });
  });
});
