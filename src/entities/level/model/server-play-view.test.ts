import type { CampaignGame } from "./campaign-types";
import { playViewOfCampaignGame, revealOfCell } from "./server-play-view";

const BOARD: CampaignGame["board"] = {
  rows: 4,
  cols: 5,
  terrain: ["..s..", "..b..", "....r", "....."],
  fences: [
    [
      [0, 0],
      [0, 1],
    ],
  ],
  beacons: [[3, 4]],
  mode: "number",
  fog: 0,
  order: false,
  limit: 8,
  stars: [5, 6],
  targets: 2,
  bombs: 1,
  buoys: 1,
};

const gameOf = (overrides: Partial<CampaignGame> = {}): CampaignGame => ({
  id: "game-1",
  level: 3,
  version: 1,
  seq: 2,
  status: "play",
  board: BOARD,
  moves: 3,
  limit: 11,
  found: 1,
  bombsLeft: 1,
  epoch: 1,
  continues: 0,
  cells: [
    { row: 3, col: 4, kind: "beacon", value: 4, tone: "warm", epoch: 0 },
    { row: 0, col: 0, kind: "buoy", value: 3, tone: "cold", nearBomb: true, epoch: 0 },
    { row: 1, col: 1, kind: "target", epoch: 0 },
  ],
  ...overrides,
});

describe("playViewOfCampaignGame", () => {
  test("draws the public layout without the hidden targets, bombs and buoys", () => {
    const view = playViewOfCampaignGame(gameOf());

    expect(view.board).toMatchObject({ rows: 4, cols: 5, targets: [], bombs: [], buoys: [] });
    expect(view.board.kinds[2]).toBe("stream");
    expect(view.board.bridges.has(7)).toBe(true);
    expect(view.board.kinds[14]).toBe("rock");
    expect(view.board.fences.size).toBe(1);
  });

  test("takes the counters and the limit with bonuses from the server", () => {
    expect(playViewOfCampaignGame(gameOf())).toMatchObject({
      status: "playing",
      movesUsed: 3,
      moveLimit: 11,
      targetCount: 2,
      foundCount: 1,
      bombCount: 1,
      bombsLeft: 1,
      buoyCount: 1,
      buoysLeft: 0,
      epoch: 1,
      continued: false,
      rules: { stars: [5, 6], moveLimit: 8 },
    });
  });

  test("opens the cells in the server's order and takes the last tap without beacons", () => {
    const view = playViewOfCampaignGame(gameOf());

    expect([...view.revealed.keys()]).toEqual([19, 0, 6]);
    expect(view.revealed.get(19)).toMatchObject({ kind: "distance", value: 4, beacon: true });
    expect(view.revealed.get(0)).toMatchObject({ buoy: true, bombNear: true, heat: "cold" });
    expect(view.lastCell).toBe(6);
  });

  test("has no limit when the server sends 0 and counts a continue", () => {
    const view = playViewOfCampaignGame(gameOf({ limit: 0, continues: 1 }));

    expect(view).toMatchObject({ moveLimit: null, continued: true });
  });

  test("shows the secrets of a finished game", () => {
    const view = playViewOfCampaignGame(
      gameOf({
        status: "abandoned",
        result: {
          stars: 0,
          moves: 8,
          newRecord: false,
          reward: 0,
          xp: 0,
          canContinue: false,
          continueCost: 15,
          secrets: {
            targets: [
              [1, 1],
              [2, 2],
            ],
            bombs: [[0, 4]],
            buoys: [[0, 0]],
          },
        },
      }),
    );

    expect(view.status).toBe("lost");
    expect(view.board).toMatchObject({ targets: [6, 12], bombs: [4], buoys: [0] });
  });
});

describe("revealOfCell", () => {
  test("turns a course answer into an arrow", () => {
    expect(
      revealOfCell(
        { row: 0, col: 0, kind: "number", direction: "left", tone: "hot", epoch: 2 },
        "direction",
      ),
    ).toEqual({ kind: "direction", dir: "W", epoch: 2, bombNear: false });
  });

  test("keeps a hot-cold comparison and treats a missing one as the first tap", () => {
    expect(
      revealOfCell({ row: 0, col: 0, kind: "number", compare: "warmer", epoch: 0 }, "hotcold"),
    ).toMatchObject({
      kind: "hotcold",
      cmp: "warmer",
    });
    expect(revealOfCell({ row: 0, col: 0, kind: "number", epoch: 0 }, "hotcold")).toMatchObject({
      cmp: "none",
    });
  });

  test("keeps the order of a target and nothing of a bomb", () => {
    expect(
      revealOfCell({ row: 0, col: 0, kind: "target", order: 2, epoch: 0 }, "distance"),
    ).toEqual({
      kind: "target",
      bombNear: false,
      order: 2,
    });
    expect(revealOfCell({ row: 0, col: 0, kind: "bomb", epoch: 0 }, "distance")).toEqual({
      kind: "bomb",
    });
  });
});
