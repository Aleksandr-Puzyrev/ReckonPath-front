import type { LevelInput } from "@reckon-path/engine";

const BASE: Omit<LevelInput, "id"> = {
  v: 2,
  world: 1,
  rows: 4,
  cols: 4,
  targets: [[1, 2]],
  probeMode: "distance",
};

export const CAMPAIGN: readonly LevelInput[] = [
  { ...BASE, id: "c-1" },
  { ...BASE, id: "c-2", moveLimit: 6, stars: [3, 4] },
  { ...BASE, id: "c-3", moveLimit: 6, stars: [3, 4], beacons: [[3, 3]] },
];

export const LEVEL_LESSONS = { "c-3": ["flags"] };
