import { applyTap, createBoard, initGame, levelSchema, validateLevel } from "@reckon-path/engine";

import { RULE_DEMOS } from "./rule-cards";

describe("RULE_DEMOS", () => {
  test.each(Object.entries(RULE_DEMOS))(
    "%s is a valid board that is still in play",
    (_id, demo) => {
      const level = levelSchema.parse(demo.level);
      expect(validateLevel(level, { kind: "custom" })).toEqual([]);
      const { board, rules } = createBoard(level);
      const game = demo.taps.reduce(
        (state, cell) => applyTap(state, cell).state,
        initGame(board, rules),
      );
      expect(game.status).toBe("playing");
    },
  );
});
