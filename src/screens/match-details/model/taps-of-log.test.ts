import type { MoveView } from "@entities/match";

import { tapsOfLog } from "./taps-of-log";

const AT = "2026-11-02T12:00:00Z";

const LOG: MoveView[] = [
  { turn: 3, by: "me", cell: [1, 1], kind: "number", at: AT },
  { turn: 1, by: "me", cell: [0, 0], kind: "bomb", at: AT },
  { turn: 2, by: "rival", kind: "timeout", at: AT },
  { turn: 4, by: "rival", cell: [2, 0], kind: "buoy", at: AT },
  { turn: 5, by: "me", kind: "skip", at: AT },
];

describe("tapsOfLog", () => {
  test("replays one player's taps in turn order", () => {
    expect(tapsOfLog(LOG, "me", 6)).toEqual([0, 7]);
  });

  test("leaves out skips and timeouts, which open no cell", () => {
    expect(tapsOfLog(LOG, "rival", 6)).toEqual([12]);
  });
});
