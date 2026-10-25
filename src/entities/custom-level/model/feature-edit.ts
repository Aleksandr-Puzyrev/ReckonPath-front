import { MAX_BEACONS, MAX_BUOYS } from "@reckon-path/engine";

import type { Cell, CustomMap } from "./custom-level-type";

export type FeatureTool = "beacon" | "buoy";

export type FeatureResult =
  | { map: CustomMap }
  | { refusal: { kind: "onRock" } | { kind: "onHidden" } | { kind: "limit"; max: number } };

const isSame = ([a, b]: readonly number[], [c, d]: readonly number[]) => a === c && b === d;
const has = (cells: readonly Cell[] | undefined, cell: Cell) =>
  (cells ?? []).some((other) => isSame(other, cell));
const without = (cells: readonly Cell[] | undefined, cell: Cell) =>
  (cells ?? []).filter((other) => !isSame(other, cell));

const FEATURES = {
  beacon: { key: "beacons", max: MAX_BEACONS },
  buoy: { key: "buoys", max: MAX_BUOYS },
} as const;

// Part 6: beacons and buoys sit on a free passable tile, never on a target, bomb or the other feature (Часть 6: маяки и буи стоят на свободной проходимой клетке, не на цели, бомбе или другой фишке).
export const toggleFeature = (map: CustomMap, tool: FeatureTool, cell: Cell): FeatureResult => {
  const { key, max } = FEATURES[tool];
  const other = FEATURES[tool === "beacon" ? "buoy" : "beacon"].key;
  if (has(map[key], cell)) return { map: { ...map, [key]: without(map[key], cell) } };
  if (has(map.rocks, cell)) return { refusal: { kind: "onRock" } };
  if (has(map.targets, cell) || has(map.bombs, cell) || has(map[other], cell)) {
    return { refusal: { kind: "onHidden" } };
  }
  if ((map[key]?.length ?? 0) >= max) return { refusal: { kind: "limit", max } };
  return { map: { ...map, [key]: [...(map[key] ?? []), cell] } };
};

export const eraseFeatures = (map: CustomMap, cell: Cell): CustomMap => ({
  ...map,
  beacons: without(map.beacons, cell),
  buoys: without(map.buoys, cell),
});
