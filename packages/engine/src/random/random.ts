const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const UINT32_RANGE = 0x1_0000_0000;

export const fnv1a32 = (key: string) => {
  let hash = FNV_OFFSET_BASIS;
  new TextEncoder().encode(key).forEach((byte) => {
    hash ^= byte;
    hash = Math.imul(hash, FNV_PRIME);
  });

  return hash >>> 0;
};

export type Rng = () => number;

export const mulberry32 = (seed: number): Rng => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
};

export const rngFromKey = (key: string) => mulberry32(fnv1a32(key));

export const randInt = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const pick = <T>(rng: Rng, items: readonly T[]): T => {
  const item = items[randInt(rng, 0, items.length - 1)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
};
