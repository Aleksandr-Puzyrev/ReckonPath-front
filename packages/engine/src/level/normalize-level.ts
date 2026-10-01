import type { LevelInput } from "./level-schema";

export const normalizeLevel = (level: LevelInput) => ({
  ...level,
  bombs: level.bombs ?? [],
  streams: level.streams ?? [],
  bridges: level.bridges ?? [],
  heavy: level.heavy ?? [],
  rocks: level.rocks ?? [],
  fences: level.fences ?? [],
  beacons: level.beacons ?? [],
  buoys: level.buoys ?? [],
  targetOrder: level.targetOrder ?? false,
  fog: level.fog ?? null,
  moveLimit: level.moveLimit ?? null,
  stars: level.stars ?? null,
  bombHint: level.bombHint ?? true,
});

export type NormalizedLevel = ReturnType<typeof normalizeLevel>;
