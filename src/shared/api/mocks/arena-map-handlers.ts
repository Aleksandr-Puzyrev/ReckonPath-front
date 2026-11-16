import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { levelFromBackend, validateLevel } from "@reckon-path/engine";
import type { ValidationError } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { MOCK_FORMAT } from "./mock-arena";
import { mockUrl } from "./mock-url";

type Schemas = components["schemas"];
type ArenaMapView = Schemas["ArenaMapView"];
type GameLevel = Schemas["GameLevel"];
type MapProblem = Schemas["MapProblem"];

const MAX_MAPS = 3;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;

const cellSchema = z.tuple([z.number().int(), z.number().int()]);
const levelSchema = z.object({
  rows: z.number().int(),
  cols: z.number().int(),
  terrain: z.array(z.string()),
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
  targets: z.array(cellSchema),
  bombs: z.array(cellSchema).optional(),
  mode: z.enum(["number", "hot_cold", "course"]),
  limit: z.number().int(),
  stars: z.array(z.number().int()),
});
const inputSchema = z.object({ name: z.string(), level: levelSchema });
const checkSchema = z.object({ level: levelSchema });

const PROBLEM_CODES: Partial<Record<ValidationError["code"], MapProblem["code"]>> = {
  SIZE: "size",
  NOT_CONNECTED: "cut",
  TARGET_COUNT: "targets",
  TOO_MANY_BOMBS: "bombs_limit",
  TOO_MANY_ROCKS: "rocks_limit",
  ELEMENT_LIMIT: "caps",
  BRIDGE_NOT_ON_STREAM: "bridge",
  FENCE_NOT_ADJACENT: "fences",
};

const problemOf = (error: ValidationError): MapProblem => ({
  code: PROBLEM_CODES[error.code] ?? "elements",
  message: error.code,
  cells: "cells" in error ? error.cells.map(([row, col]): [number, number] => [row, col]) : [],
});

export const checkMockLevel = (level: GameLevel): MapProblem[] => {
  const { caps } = MOCK_FORMAT;
  return validateLevel(levelFromBackend(level, "mock-map"), {
    kind: "pvp",
    format: {
      rows: MOCK_FORMAT.rows,
      cols: MOCK_FORMAT.cols,
      targets: MOCK_FORMAT.targets,
      limits: {
        fences: caps.fences,
        streams: caps.stream,
        heavy: caps.heavy,
        rocks: caps.rock,
        bridges: caps.bridge,
        bombs: caps.bombs,
      },
    },
  }).map(problemOf);
};

export const MOCK_RANDOM_LEVEL: GameLevel = {
  rows: MOCK_FORMAT.rows,
  cols: MOCK_FORMAT.cols,
  terrain: ["......", ".ss...", "......", "...r..", "......", "......"],
  fences: [
    [
      [2, 2],
      [2, 3],
    ],
  ],
  targets: [[4, 4]],
  bombs: [[1, 4]],
  mode: "number",
  limit: 0,
  stars: [0, 0],
};

let maps: ArenaMapView[] = [];
let count = 0;

export const resetMockArenaMaps = () => {
  maps = [];
  count = 0;
};

export const mockArenaMaps = () => maps;

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, details } }, { status });

const readBody = async <T>(request: Request, schema: z.ZodType<T>) =>
  schema.safeParse(await request.json().catch(() => null));

const viewOf = (id: string, name: string, level: GameLevel, active: boolean): ArenaMapView => {
  const problems = checkMockLevel(level);
  const valid = problems.length === 0;
  return {
    id,
    name,
    level,
    valid,
    problems,
    ...(valid ? { botMoves: level.targets.length * 4 } : {}),
    wins: 0,
    plays: 0,
    active: valid && active,
    updatedAt: new Date().toISOString(),
  };
};

// The first valid map becomes active, as on the backend (первая валидная карта становится активной, как на бэкенде).
const withActive = (next: ArenaMapView[]) =>
  next.some(({ active }) => active)
    ? next
    : next.map((map, index) => ({
        ...map,
        active: index === next.findIndex(({ valid }) => valid),
      }));

export const arenaMapHandlers = [
  http.get(mockUrl("/arena/maps"), () =>
    HttpResponse.json({ format: MOCK_FORMAT, maps, max: MAX_MAPS }),
  ),
  http.post(mockUrl("/arena/maps/check"), async ({ request }) => {
    const body = await readBody(request, checkSchema);
    if (!body.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    const problems = checkMockLevel(body.data.level);
    const taps = body.data.level.targets;
    return HttpResponse.json({
      valid: problems.length === 0,
      problems,
      bot: { moves: taps.length, taps },
    });
  }),
  http.post(mockUrl("/arena/maps/random"), () => HttpResponse.json({ level: MOCK_RANDOM_LEVEL })),
  http.post(mockUrl("/arena/maps"), async ({ request }) => {
    const body = await readBody(request, inputSchema);
    if (!body.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    if (maps.length >= MAX_MAPS) return errorResponse("maps_limit", HTTP_CONFLICT);
    count += 1;
    maps = withActive([...maps, viewOf(`map_${count}`, body.data.name, body.data.level, false)]);
    return HttpResponse.json(maps.at(-1));
  }),
  http.put(mockUrl("/arena/maps/:id"), async ({ request, params }) => {
    const current = maps.find(({ id }) => id === String(params.id));
    if (current === undefined) return errorResponse("map_not_found", HTTP_NOT_FOUND);
    const body = await readBody(request, inputSchema);
    if (!body.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    const map = viewOf(current.id, body.data.name, body.data.level, current.active);
    maps = maps.map((saved) => (saved.id === map.id ? map : saved));
    return HttpResponse.json(map);
  }),
  http.delete(mockUrl("/arena/maps/:id"), ({ params }) => {
    if (!maps.some(({ id }) => id === String(params.id))) {
      return errorResponse("map_not_found", HTTP_NOT_FOUND);
    }
    maps = maps.filter(({ id }) => id !== String(params.id));
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.post(mockUrl("/arena/maps/:id/activate"), ({ params }) => {
    const map = maps.find(({ id }) => id === String(params.id));
    if (map === undefined) return errorResponse("map_not_found", HTTP_NOT_FOUND);
    if (!map.valid) {
      return errorResponse("map_invalid", HTTP_UNPROCESSABLE, { problems: map.problems });
    }
    maps = maps.map((saved) => ({ ...saved, active: saved.id === map.id }));
    return HttpResponse.json({ ...map, active: true });
  }),
];
