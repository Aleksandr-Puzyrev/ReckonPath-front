import { campaignTapEvents } from "./campaign-tap-events";
import type { CampaignGame } from "./campaign-types";
import { playViewOfCampaignGame } from "./server-play-view";

const gameOf = (overrides: Partial<CampaignGame>): CampaignGame => ({
  id: "game-1",
  level: 1,
  version: 1,
  seq: 1,
  status: "play",
  board: {
    rows: 4,
    cols: 4,
    terrain: ["....", "....", "....", "...."],
    fences: [],
    beacons: [],
    mode: "number",
    fog: 0,
    order: false,
    limit: 4,
    stars: [2, 3],
    targets: 2,
    bombs: 1,
    buoys: 0,
  },
  moves: 1,
  limit: 4,
  found: 0,
  bombsLeft: 1,
  epoch: 0,
  continues: 0,
  cells: [],
  ...overrides,
});

const eventsOf = (game: CampaignGame, cell: number) =>
  campaignTapEvents(cell, game, playViewOfCampaignGame(game));

describe("campaignTapEvents", () => {
  test("reveals a bearing", () => {
    const game = gameOf({
      cells: [{ row: 0, col: 0, kind: "number", value: 4, tone: "warm", epoch: 0 }],
    });

    expect(eventsOf(game, 0)).toEqual([
      { type: "reveal", cell: 0, reveal: expect.objectContaining({ kind: "distance", value: 4 }) },
    ]);
  });

  test("tells a found target with the targets left", () => {
    const game = gameOf({ found: 1, cells: [{ row: 0, col: 1, kind: "target", epoch: 0 }] });

    expect(eventsOf(game, 1)).toEqual([{ type: "targetFound", cell: 1, left: 1 }]);
  });

  test("tells a bomb that ends the game as a loss (LVL-09)", () => {
    const game = gameOf({
      status: "lost",
      moves: 4,
      cells: [{ row: 0, col: 2, kind: "bomb", epoch: 0 }],
    });

    expect(eventsOf(game, 2)).toEqual([{ type: "bomb", cell: 2, penalty: 2 }, { type: "lose" }]);
  });

  test("tells a win with the server's stars", () => {
    const game = gameOf({
      status: "won",
      found: 2,
      cells: [{ row: 0, col: 3, kind: "target", epoch: 0 }],
      result: {
        stars: 2,
        moves: 3,
        newRecord: true,
        reward: 30,
        xp: 10,
        canContinue: false,
        continueCost: 15,
      },
    });

    expect(eventsOf(game, 3)).toEqual([
      { type: "targetFound", cell: 3, left: 0 },
      { type: "win", moves: 1, stars: 2 },
    ]);
  });

  test("tells nothing for a cell the game has not opened", () => {
    expect(eventsOf(gameOf({}), 5)).toEqual([]);
  });
});
