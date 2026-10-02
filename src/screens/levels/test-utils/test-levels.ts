import type { LevelInput } from "@reckon-path/engine";

const LEVEL: Omit<LevelInput, "id"> = {
  v: 2,
  world: 1,
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  probeMode: "distance",
  moveLimit: 6,
  stars: [3, 4],
};

export const CAMPAIGN: readonly LevelInput[] = [
  { ...LEVEL, id: "c-a" },
  { ...LEVEL, id: "c-b", bombs: [[0, 3]] },
  { ...LEVEL, id: "c-c" },
];
