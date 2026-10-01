import { levelSchema } from "../level/level-schema";

export const makeLevel = (overrides: Record<string, unknown> = {}) =>
  levelSchema.parse({
    v: 2,
    id: "u-test",
    rows: 5,
    cols: 5,
    targets: [[4, 4]],
    probeMode: "distance",
    ...overrides,
  });
