import { levelFromBackend, levelToBackend } from "@reckon-path/engine";
import type { BackendLevel, LevelInput } from "@reckon-path/engine";

import type { ArenaMap, ArenaMapView, GameLevel, PvpMap, WireLevel } from "./arena-map-type";

type Point = [number, number];

const MAP_ID = "u-arena-map";

const pointOf = ([row = 0, col = 0]: readonly number[]): Point => [row, col];

export const levelOfMap = (map: PvpMap): LevelInput => ({
  ...map,
  v: 2,
  id: MAP_ID,
  probeMode: "distance",
});

const backendLevelOf = (level: WireLevel): BackendLevel => ({
  ...level,
  fences: (level.fences ?? []).map(([from = [], to = []]): [Point, Point] => [
    pointOf(from),
    pointOf(to),
  ]),
  beacons: (level.beacons ?? []).map(pointOf),
  targets: level.targets.map(pointOf),
  bombs: (level.bombs ?? []).map(pointOf),
  buoys: (level.buoys ?? []).map(pointOf),
});

export const mapOfLevel = (level: WireLevel): PvpMap => {
  const { rows, cols, targets, bombs, streams, bridges, heavy, rocks, fences } = levelFromBackend(
    backendLevelOf(level),
    MAP_ID,
  );
  return { rows, cols, targets, bombs, streams, bridges, heavy, rocks, fences };
};

export const gameLevelOfMap = (map: PvpMap): GameLevel => {
  const level = levelToBackend(levelOfMap(map));
  return {
    ...level,
    terrain: [...level.terrain],
    fences: (level.fences ?? []).map(([from, to]): [Point, Point] => [pointOf(from), pointOf(to)]),
    beacons: (level.beacons ?? []).map(pointOf),
    buoys: (level.buoys ?? []).map(pointOf),
    targets: level.targets.map(pointOf),
    bombs: (level.bombs ?? []).map(pointOf),
    stars: [...level.stars],
  };
};

export const arenaMapOf = (view: ArenaMapView): ArenaMap => ({
  id: view.id,
  name: view.name,
  map: mapOfLevel(view.level),
  valid: view.valid,
  problems: view.problems ?? [],
  botMoves: view.botMoves ?? null,
  wins: view.wins,
  plays: view.plays,
  active: view.active,
});
