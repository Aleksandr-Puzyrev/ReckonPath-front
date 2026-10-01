import type { GameEvent } from "@reckon-path/engine";

import { hapticsForEvents } from "./haptics-for-events";

const reveal = (heat: "hot" | "warm"): GameEvent => ({
  type: "reveal",
  cell: 0,
  reveal: { kind: "distance", value: 2, heat, epoch: 0, bombNear: false },
});

describe("hapticsForEvents", () => {
  test.each<[string, GameEvent[], string[]]>([
    ["a warm answer", [reveal("warm")], ["light"]],
    ["a hot answer", [reveal("hot")], ["medium"]],
    ["a found target", [{ type: "targetFound", cell: 0, left: 1 }], ["success"]],
    ["a bomb", [{ type: "bomb", cell: 0, penalty: 2 }], ["heavy", "error"]],
    ["a rock", [{ type: "blocked", cell: 0 }], ["warning"]],
    ["an opened cell", [{ type: "alreadyRevealed", cell: 0 }], ["warning"]],
    [
      "a win over its target",
      [
        { type: "targetFound", cell: 0, left: 0 },
        { type: "win", moves: 3, stars: 3 },
      ],
      ["success"],
    ],
    ["a loss after an answer", [reveal("warm"), { type: "lose" }], ["warning"]],
  ])("plays the haptic for %s", (_name, events, expected) => {
    expect(hapticsForEvents(events)).toEqual(expected);
  });
});
