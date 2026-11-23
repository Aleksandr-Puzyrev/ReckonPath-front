import { levelFromBackend, levelToBackend } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import type { ArenaMap, ArenaMapView, GameLevel, PvpMap, WireLevel } from "./arena-map-type";

const MAP_ID = "u-arena-map";

export const levelOfMap = (map: PvpMap): LevelInput => ({
  ...map,
  v: 2,
  id: MAP_ID,
  probeMode: "distance",
});

export const mapOfLevel = (level: WireLevel): PvpMap => {
  const { rows, cols, targets, bombs, streams, bridges, heavy, rocks, fences } = levelFromBackend(
    level,
    MAP_ID,
  );
  return { rows, cols, targets, bombs, streams, bridges, heavy, rocks, fences };
};

export const gameLevelOfMap = (map: PvpMap): GameLevel => levelToBackend(levelOfMap(map));

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
