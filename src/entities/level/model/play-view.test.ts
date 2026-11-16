import { applyTap, createBoard, initGame, levelSchema } from "@reckon-path/engine";

import { isStaleIn, playViewOfGame } from "./play-view";

const gameOf = () => {
  const { board, rules } = createBoard(
    levelSchema.parse({
      v: 2,
      id: "u-view",
      rows: 4,
      cols: 4,
      targets: [
        [0, 0],
        [3, 3],
      ],
      bombs: [[0, 3]],
      buoys: [[2, 2]],
      probeMode: "distance",
      moveLimit: 8,
      stars: [4, 6],
    }),
  );
  return initGame(board, rules);
};

describe("playViewOfGame", () => {
  test("counts the local game the way the server does", () => {
    const game = [3, 10, 0].reduce((state, cell) => applyTap(state, cell).state, gameOf());

    expect(playViewOfGame(game, 0)).toMatchObject({
      movesUsed: 4,
      moveLimit: 11,
      targetCount: 2,
      foundCount: 1,
      bombCount: 1,
      bombsLeft: 0,
      buoyCount: 1,
      buoysLeft: 0,
      epoch: 1,
      lastCell: 0,
    });
  });
});

describe("isStaleIn", () => {
  test("greys out answers from before the last found target only", () => {
    expect(
      isStaleIn(
        { epoch: 1 },
        { kind: "distance", value: 2, heat: "hot", epoch: 0, bombNear: false },
      ),
    ).toBe(true);
    expect(isStaleIn({ epoch: 1 }, { kind: "target", bombNear: false })).toBe(false);
  });
});
