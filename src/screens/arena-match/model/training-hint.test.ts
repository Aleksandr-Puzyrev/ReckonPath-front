import type { MatchEnd, MatchTap } from "@entities/match";

import { trainingHintOf } from "./training-hint";

const tap = (outcome: MatchTap["outcome"]): MatchTap => ({
  turn: 1,
  cell: [0, 0],
  outcome,
  value: outcome === "pelang" ? 2 : null,
  bombNear: false,
});

const endWith = (result: MatchEnd["result"]) => ({ result }) as MatchEnd;

describe("trainingHintOf", () => {
  test("asks for the first tap before any move (design 30.1)", () => {
    expect(trainingHintOf([], null)).toBe("first");
  });

  test("explains taking turns after a signal", () => {
    expect(trainingHintOf([tap("pelang")], null)).toBe("turns");
  });

  test("keeps the bomb lesson once a bomb was hit", () => {
    expect(trainingHintOf([tap("bomb"), tap("pelang")], null)).toBe("bomb");
  });

  test("praises a win and comforts after the mentor wins (decision 0037 #6)", () => {
    expect(trainingHintOf([tap("target")], endWith("win"))).toBe("won");
    expect(trainingHintOf([tap("pelang")], endWith("loss"))).toBe("lost");
  });
});
