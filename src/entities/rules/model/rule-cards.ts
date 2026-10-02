import type { Idx, LevelInput } from "@reckon-path/engine";

export type RuleCardId =
  | "distance"
  | "flags"
  | "fence"
  | "stream"
  | "bridge"
  | "heavy"
  | "rock"
  | "multi"
  | "bomb"
  | "bombNear"
  | "beacon"
  | "buoy"
  | "fog"
  | "order"
  | "direction"
  | "hotcold";

export interface RuleDemo {
  level: LevelInput;
  taps: readonly Idx[];
  flags?: readonly Idx[];
  highlight?: readonly Idx[];
}

const base = (id: RuleCardId, overrides: Partial<LevelInput>): LevelInput => ({
  v: 2,
  id: `u-rule-${id.toLowerCase()}`,
  rows: 4,
  cols: 4,
  targets: [[0, 3]],
  probeMode: "distance",
  ...overrides,
});

const STREAM_COLUMN: [number, number][] = [
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];
const TWO_TARGETS: [number, number][] = [
  [0, 0],
  [3, 3],
];

// Demo boards follow the design's card catalogue (мини-поля повторяют каталог карточек из дизайна).
export const RULE_DEMOS: Record<RuleCardId, RuleDemo> = {
  distance: { level: base("distance", {}), taps: [12, 9] },
  flags: { level: base("flags", {}), taps: [0], flags: [5, 6] },
  fence: {
    level: base("fence", {
      fences: [
        [
          [0, 2],
          [0, 3],
        ],
        [
          [1, 2],
          [1, 3],
        ],
      ],
    }),
    taps: [2],
  },
  stream: { level: base("stream", { streams: STREAM_COLUMN }), taps: [0] },
  bridge: {
    level: base("bridge", { streams: STREAM_COLUMN, bridges: [[1, 1]], targets: [[1, 3]] }),
    taps: [4],
  },
  heavy: {
    level: base("heavy", {
      heavy: [
        [1, 1],
        [1, 2],
      ],
    }),
    taps: [4],
  },
  rock: {
    level: base("rock", {
      rocks: [
        [1, 1],
        [2, 1],
      ],
    }),
    taps: [4],
  },
  multi: { level: base("multi", { targets: TWO_TARGETS }), taps: [5, 0, 10] },
  bomb: { level: base("bomb", { bombs: [[1, 2]] }), taps: [5, 6] },
  bombNear: { level: base("bombNear", { bombs: [[1, 2]] }), taps: [5], highlight: [5, 1, 4, 6, 9] },
  beacon: {
    level: base("beacon", {
      beacons: [
        [0, 0],
        [3, 3],
      ],
    }),
    taps: [],
  },
  buoy: { level: base("buoy", { buoys: [[3, 3]] }), taps: [15] },
  fog: { level: base("fog", { fog: 2, targets: [[2, 2]] }), taps: [0, 3, 12, 15] },
  order: { level: base("order", { targets: TWO_TARGETS, targetOrder: true }), taps: [5, 0, 10] },
  direction: { level: base("direction", { probeMode: "direction" }), taps: [12, 9, 6] },
  hotcold: { level: base("hotcold", { probeMode: "hotcold" }), taps: [12, 9, 10] },
};
