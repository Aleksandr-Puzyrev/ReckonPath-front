import type { LevelInput } from "@reckon-path/engine";

// TODO: replace with the authored levels of worlds 1–2 (stage 1, task 3)
export const TEST_LEVELS: readonly LevelInput[] = [
  {
    v: 2,
    id: "c-test-1",
    rows: 4,
    cols: 4,
    targets: [[2, 3]],
    probeMode: "distance",
    moveLimit: 5,
    stars: [3, 3],
  },
  {
    v: 2,
    id: "c-test-2",
    rows: 5,
    cols: 5,
    targets: [[0, 4]],
    beacons: [[2, 2]],
    fences: [
      [
        [1, 3],
        [1, 4],
      ],
      [
        [2, 3],
        [2, 4],
      ],
      [
        [3, 3],
        [3, 4],
      ],
    ],
    probeMode: "distance",
    moveLimit: 4,
    stars: [2, 3],
  },
  {
    v: 2,
    id: "c-test-3",
    rows: 6,
    cols: 6,
    targets: [
      [0, 5],
      [5, 1],
    ],
    streams: [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
    ],
    bridges: [[2, 2]],
    heavy: [
      [4, 4],
      [4, 5],
    ],
    rocks: [[1, 4]],
    bombs: [[3, 4]],
    buoys: [[5, 5]],
    probeMode: "distance",
    moveLimit: 6,
    stars: [4, 5],
  },
  {
    v: 2,
    id: "c-test-4",
    rows: 5,
    cols: 5,
    targets: [
      [1, 1],
      [3, 4],
    ],
    targetOrder: true,
    probeMode: "hotcold",
    moveLimit: 13,
    stars: [8, 10],
  },
  {
    v: 2,
    id: "c-test-5",
    rows: 5,
    cols: 5,
    targets: [[4, 2]],
    fog: 3,
    probeMode: "direction",
    moveLimit: 6,
    stars: [4, 5],
  },
];
