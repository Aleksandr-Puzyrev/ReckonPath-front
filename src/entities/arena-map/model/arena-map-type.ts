import type { LevelInput } from "@reckon-path/engine";

import type { components } from "@shared/api";

import type { fetchArenaMaps } from "../api/arena-map-queries";

type Schemas = components["schemas"];

// Answers read through openapi-fetch have their tuples widened to arrays (ответы, прочитанные через openapi-fetch, получают кортежи расширенными до массивов).
export type ArenaMapView = Awaited<ReturnType<typeof fetchArenaMaps>>["maps"][number];
export type WireLevel = ArenaMapView["level"];
export type GameLevel = Schemas["GameLevel"];
export type MatchFormat = Schemas["MatchFormat"];
export type MapCaps = Schemas["MapCaps"];
export type MapProblem = ArenaMapView["problems"] extends (infer P)[] | undefined ? P : never;
export type MapCheck = Schemas["MapCheck"];

// The editor keeps the engine model; the backend level exists only at the API boundary (редактор хранит модель движка; уровень бэкенда существует только на границе API).
export type PvpMap = Pick<
  LevelInput,
  "rows" | "cols" | "targets" | "bombs" | "streams" | "bridges" | "heavy" | "rocks" | "fences"
>;

export type MapFormat = Pick<MatchFormat, "targets" | "caps">;

export interface ArenaMap {
  id: string;
  name: string;
  map: PvpMap;
  valid: boolean;
  problems: MapProblem[];
  botMoves: number | null;
  wins: number;
  plays: number;
  active: boolean;
}

export interface ArenaMaps {
  format: MatchFormat;
  maps: ArenaMap[];
  max: number;
}
