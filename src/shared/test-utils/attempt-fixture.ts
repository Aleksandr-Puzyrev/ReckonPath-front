import type { components } from "../api/generated/schema";

type Attempt = components["schemas"]["Attempt"];

let sequence = 0;

export const attemptFixture = (overrides: Partial<Attempt> = {}): Attempt => {
  sequence += 1;
  return {
    attemptId: `attempt-${sequence}`,
    mode: "campaign",
    ref: "c-1",
    taps: [[0, 0]],
    claimed: { result: "won", movesUsed: 1, stars: 3 },
    ...overrides,
  };
};
