import type { LevelInput } from "@reckon-path/engine";

const LEVEL: Omit<LevelInput, "id"> = {
  v: 2,
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  bombs: [[0, 3]],
  probeMode: "distance",
  moveLimit: 4,
  stars: [2, 3],
};

export const TEST_LEVELS: readonly LevelInput[] = [
  { ...LEVEL, id: "c-a" },
  { ...LEVEL, id: "c-b" },
];
