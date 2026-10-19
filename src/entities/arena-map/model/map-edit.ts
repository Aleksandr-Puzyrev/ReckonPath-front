import type { components } from "@shared/api";

import type { PvpMap } from "./arena-map-type";

type ArenaFormat = components["schemas"]["ArenaFormat"];
type Cell = [number, number];
type Fence = [Cell, Cell];

export type CellTool = "target" | "stream" | "heavy" | "rock" | "bridge" | "bomb" | "erase";
export type LimitedElement =
  "targets" | "fences" | "streams" | "heavy" | "rocks" | "bridges" | "bombs";
export type ElementCounts = Record<LimitedElement, number>;

export type EditRefusal =
  | { kind: "targetOnRock" }
  | { kind: "bombOnRock" }
  | { kind: "rockOnElement" }
  | { kind: "bombAndTarget" }
  | { kind: "bridgeOffStream" }
  | { kind: "limit"; max: number };

export type EditResult = { map: PvpMap } | { refusal: EditRefusal };

type Terrain = "streams" | "heavy" | "rocks";

const TERRAIN_OF: Partial<Record<CellTool, Terrain>> = {
  stream: "streams",
  heavy: "heavy",
  rock: "rocks",
};
const TERRAINS: readonly Terrain[] = ["streams", "heavy", "rocks"];
const MAX_BOMBS = 5;
const PASSABLE_PER_BOMB = 12;

const isSame = ([a, b]: readonly number[], [c, d]: readonly number[]) => a === c && b === d;
const has = (cells: readonly Cell[] | undefined, cell: Cell) =>
  (cells ?? []).some((other) => isSame(other, cell));
const without = (cells: readonly Cell[] | undefined, cell: Cell) =>
  (cells ?? []).filter((other) => !isSame(other, cell));
const isSameFence = ([a, b]: Fence, [c, d]: Fence) =>
  (isSame(a, c) && isSame(b, d)) || (isSame(a, d) && isSame(b, c));
const touches = ([a, b]: Fence, cell: Cell) => isSame(a, cell) || isSame(b, cell);

export const countElements = (map: PvpMap): ElementCounts => ({
  targets: map.targets.length,
  fences: map.fences?.length ?? 0,
  streams: map.streams?.length ?? 0,
  heavy: map.heavy?.length ?? 0,
  rocks: map.rocks?.length ?? 0,
  bridges: map.bridges?.length ?? 0,
  bombs: map.bombs?.length ?? 0,
});

export const limitsOf = ({ targets, limits }: ArenaFormat, map: PvpMap): ElementCounts => {
  const passable = map.rows * map.cols - countElements(map).rocks;
  return {
    targets,
    fences: limits.fence,
    streams: limits.stream,
    heavy: limits.heavy,
    rocks: limits.rock,
    bridges: limits.bridge,
    bombs: Math.min(limits.bomb, MAX_BOMBS, Math.floor(passable / PASSABLE_PER_BOMB)),
  };
};

const terrainOf = (map: PvpMap, cell: Cell) => TERRAINS.find((terrain) => has(map[terrain], cell));

const isFull = (map: PvpMap, format: ArenaFormat, element: LimitedElement) =>
  countElements(map)[element] >= limitsOf(format, map)[element];

const limitRefusal = (map: PvpMap, format: ArenaFormat, element: LimitedElement): EditResult => ({
  refusal: { kind: "limit", max: limitsOf(format, map)[element] },
});

const clearTerrain = (map: PvpMap, cell: Cell): PvpMap => ({
  ...map,
  streams: without(map.streams, cell),
  heavy: without(map.heavy, cell),
  rocks: without(map.rocks, cell),
  bridges: without(map.bridges, cell),
});

const placeTerrain = (
  map: PvpMap,
  format: ArenaFormat,
  terrain: Terrain,
  cell: Cell,
): EditResult => {
  if (terrain === "rocks" && (has(map.targets, cell) || has(map.bombs, cell))) {
    return { refusal: { kind: "rockOnElement" } };
  }
  const cleared = clearTerrain(map, cell);
  if (isFull(cleared, format, terrain)) return limitRefusal(cleared, format, terrain);
  return { map: { ...cleared, [terrain]: [...(cleared[terrain] ?? []), cell] } };
};

const placeTarget = (map: PvpMap, format: ArenaFormat, cell: Cell): EditResult => {
  if (has(map.rocks, cell)) return { refusal: { kind: "targetOnRock" } };
  if (has(map.bombs, cell)) return { refusal: { kind: "bombAndTarget" } };
  if (isFull(map, format, "targets")) return limitRefusal(map, format, "targets");
  return { map: { ...map, targets: [...map.targets, cell] } };
};

const placeBomb = (map: PvpMap, format: ArenaFormat, cell: Cell): EditResult => {
  if (has(map.rocks, cell)) return { refusal: { kind: "bombOnRock" } };
  if (has(map.targets, cell)) return { refusal: { kind: "bombAndTarget" } };
  if (isFull(map, format, "bombs")) return limitRefusal(map, format, "bombs");
  return { map: { ...map, bombs: [...(map.bombs ?? []), cell] } };
};

const placeBridge = (map: PvpMap, format: ArenaFormat, cell: Cell): EditResult => {
  if (!has(map.streams, cell)) return { refusal: { kind: "bridgeOffStream" } };
  if (isFull(map, format, "bridges")) return limitRefusal(map, format, "bridges");
  return { map: { ...map, bridges: [...(map.bridges ?? []), cell] } };
};

const eraseCell = (map: PvpMap, cell: Cell): PvpMap => ({
  ...clearTerrain(map, cell),
  targets: without(map.targets, cell),
  bombs: without(map.bombs, cell),
  fences: (map.fences ?? []).filter((fence) => !touches(fence, cell)),
});

const isPlaced = (map: PvpMap, tool: CellTool, cell: Cell) => {
  const terrain = TERRAIN_OF[tool];
  if (terrain !== undefined) return terrainOf(map, cell) === terrain;
  if (tool === "target") return has(map.targets, cell);
  if (tool === "bomb") return has(map.bombs, cell);
  return tool === "bridge" && has(map.bridges, cell);
};

const remove = (map: PvpMap, tool: CellTool, cell: Cell): PvpMap => {
  if (TERRAIN_OF[tool] !== undefined) return clearTerrain(map, cell);
  if (tool === "target") return { ...map, targets: without(map.targets, cell) };
  if (tool === "bomb") return { ...map, bombs: without(map.bombs, cell) };
  return { ...map, bridges: without(map.bridges, cell) };
};

export const paintCell = (
  map: PvpMap,
  format: ArenaFormat,
  tool: CellTool,
  cell: Cell,
): EditResult => {
  if (tool === "erase") return { map: eraseCell(map, cell) };
  if (isPlaced(map, tool, cell)) return { map };
  const terrain = TERRAIN_OF[tool];
  if (terrain !== undefined) return placeTerrain(map, format, terrain, cell);
  if (tool === "target") return placeTarget(map, format, cell);
  if (tool === "bomb") return placeBomb(map, format, cell);
  return placeBridge(map, format, cell);
};

export const toggleCell = (
  map: PvpMap,
  format: ArenaFormat,
  tool: CellTool,
  cell: Cell,
): EditResult => {
  if (tool !== "erase" && isPlaced(map, tool, cell)) return { map: remove(map, tool, cell) };
  return paintCell(map, format, tool, cell);
};

export const addFence = (map: PvpMap, format: ArenaFormat, fence: Fence): EditResult => {
  if ((map.fences ?? []).some((other) => isSameFence(other, fence))) return { map };
  if (isFull(map, format, "fences")) return limitRefusal(map, format, "fences");
  return { map: { ...map, fences: [...(map.fences ?? []), fence] } };
};

export const toggleFence = (map: PvpMap, format: ArenaFormat, fence: Fence): EditResult => {
  const fences = map.fences ?? [];
  if (!fences.some((other) => isSameFence(other, fence))) return addFence(map, format, fence);
  return { map: { ...map, fences: fences.filter((other) => !isSameFence(other, fence)) } };
};

// The editor route id of a map not saved yet (id маршрута редактора для ещё не сохранённой карты).
export const MAPS_PER_FORMAT = 3;

export const NEW_MAP_ID = "new";

export const emptyMap = (size: number): PvpMap => ({ rows: size, cols: size, targets: [] });

export const isMapEmpty = (map: PvpMap) =>
  Object.values(countElements(map)).every((count) => count === 0);
