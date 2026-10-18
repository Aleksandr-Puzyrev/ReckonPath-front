import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import type { components } from "../generated/schema";

import { ARENA_FORMAT } from "./mock-arena-format";
import { checkMockMap, randomMockMap } from "./mock-map-check";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type ArenaMap = components["schemas"]["ArenaMap"];

const STATE_NAME = "arena-maps";
const MAPS_PER_FORMAT = 3;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const HTTP_INTERNAL = 500;

interface ArenaMapsState {
  maps: ArenaMap[];
  count: number;
}

const cellSchema = z.tuple([z.number().int(), z.number().int()]);
const cellsSchema = z.array(cellSchema).optional();
const mapSchema = z.object({
  rows: z.number().int(),
  cols: z.number().int(),
  targets: z.array(cellSchema),
  bombs: cellsSchema,
  streams: cellsSchema,
  bridges: cellsSchema,
  heavy: cellsSchema,
  rocks: cellsSchema,
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
});
// The mock knows only the player's format; another one is a malformed request (мок знает только формат игрока; другой — некорректный запрос).
const formatSchema = z.literal(ARENA_FORMAT.size);
const inputSchema = z.object({ name: z.string(), format: formatSchema, map: mapSchema });
const validateSchema = z.object({ format: formatSchema, map: mapSchema });
const randomSchema = z.object({ format: formatSchema });

let state = loadMockState<ArenaMapsState>(STATE_NAME, { maps: [], count: 0 });

const saveState = (next: ArenaMapsState) => {
  state = next;
  saveMockState(STATE_NAME, state);
};

export const resetMockArenaMaps = () => {
  state = { maps: [], count: 0 };
  clearMockState(STATE_NAME);
};

export const mockActiveMapId = () => state.maps.find(({ active }) => active)?.id ?? null;

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, details } }, { status });

const readBody = async <T>(request: Request, schema: z.ZodType<T>) =>
  schema.safeParse(await request.json().catch(() => null));

const findMap = (id: unknown) => state.maps.find((map) => map.id === String(id));

export const mockArenaMap = (id: string) => findMap(id);

export const arenaMapHandlers = [
  http.get(mockUrl("/arena/maps"), () => HttpResponse.json(state.maps)),
  http.post(mockUrl("/arena/maps/validate"), async ({ request }) => {
    const body = await readBody(request, validateSchema);
    if (!body.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    return HttpResponse.json(checkMockMap(ARENA_FORMAT, body.data.map));
  }),
  http.post(mockUrl("/arena/maps/random"), async ({ request }) => {
    const body = await readBody(request, randomSchema);
    if (!body.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    const random = randomMockMap(ARENA_FORMAT);
    return random === null ? errorResponse("INTERNAL", HTTP_INTERNAL) : HttpResponse.json(random);
  }),
  http.post(mockUrl("/arena/maps"), async ({ request }) => {
    const body = await readBody(request, inputSchema);
    if (!body.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    const input = body.data;
    const sameFormat = state.maps.filter(({ format }) => format === input.format);
    if (sameFormat.length >= MAPS_PER_FORMAT)
      return errorResponse("LIMIT_REACHED", HTTP_UNPROCESSABLE);
    const count = state.count + 1;
    const map: ArenaMap = {
      ...input,
      ...checkMockMap(ARENA_FORMAT, input.map),
      id: `map_${count}`,
      active: false,
      plays: 0,
      defended: 0,
    };
    saveState({ maps: [...state.maps, map], count });
    return HttpResponse.json(map);
  }),
  http.put(mockUrl("/arena/maps/:id"), async ({ request, params }) => {
    const current = findMap(params.id);
    if (current === undefined) return errorResponse("NOT_FOUND", HTTP_NOT_FOUND);
    const body = await readBody(request, inputSchema);
    if (!body.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    const map: ArenaMap = {
      ...current,
      ...body.data,
      ...checkMockMap(ARENA_FORMAT, body.data.map),
    };
    saveState({ ...state, maps: state.maps.map((saved) => (saved.id === map.id ? map : saved)) });
    return HttpResponse.json(map);
  }),
  http.delete(mockUrl("/arena/maps/:id"), ({ params }) => {
    const map = findMap(params.id);
    if (map === undefined) return errorResponse("NOT_FOUND", HTTP_NOT_FOUND);
    if (map.active) return errorResponse("MAP_ACTIVE", HTTP_CONFLICT);
    saveState({ ...state, maps: state.maps.filter(({ id }) => id !== map.id) });
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.post(mockUrl("/arena/maps/:id/activate"), ({ params }) => {
    const map = findMap(params.id);
    if (map === undefined) return errorResponse("NOT_FOUND", HTTP_NOT_FOUND);
    if (!map.valid) {
      return errorResponse("MAP_INVALID", HTTP_UNPROCESSABLE, { errors: map.errors });
    }
    saveState({
      ...state,
      maps: state.maps.map((saved) => ({ ...saved, active: saved.id === map.id })),
    });
    return HttpResponse.json({ activeMapId: map.id });
  }),
];
