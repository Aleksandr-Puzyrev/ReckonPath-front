import { tapsOnMap } from "./taps-on-map";

describe("tapsOnMap", () => {
  test("keeps one player's taps as cell indexes in turn order", () => {
    const taps = [
      {
        turn: 1,
        player: "me" as const,
        cell: [0, 1] as [number, number],
        outcome: "pelang" as const,
      },
      {
        turn: 2,
        player: "opponent" as const,
        cell: [2, 2] as [number, number],
        outcome: "target" as const,
      },
      {
        turn: 3,
        player: "me" as const,
        cell: [4, 0] as [number, number],
        outcome: "bomb" as const,
      },
    ];

    expect(tapsOnMap(taps, "me", 5)).toEqual([1, 20]);
    expect(tapsOnMap(taps, "opponent", 5)).toEqual([12]);
  });
});
