import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { levelSchema, validateLevel } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type CustomLevel = components["schemas"]["CustomLevel"];

const STATE_NAME = "custom-levels";
const LEVELS_LIMIT = 20;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE = 422;

interface CustomLevelsState {
  levels: CustomLevel[];
  count: number;
}

const START_STATE: CustomLevelsState = { levels: [], count: 0 };

const inputSchema = z.object({ level: levelSchema });

let state: CustomLevelsState = loadMockState(STATE_NAME, START_STATE);

export const resetMockCustomLevels = () => {
  state = START_STATE;
  clearMockState(STATE_NAME);
};

const save = (next: CustomLevelsState) => {
  state = next;
  saveMockState(STATE_NAME, state);
};

const errorOf = (code: string, status: number) =>
  HttpResponse.json({ error: { code } }, { status });

const parseLevel = async (request: Request) => {
  const body = inputSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return null;
  return validateLevel(body.data.level, { kind: "custom" }).length === 0 ? body.data.level : null;
};

export const customLevelHandlers = [
  http.get(mockUrl("/levels/custom"), () => HttpResponse.json({ items: state.levels })),
  http.post(mockUrl("/levels/custom"), async ({ request }) => {
    if (state.levels.length >= LEVELS_LIMIT) return errorOf("LIMIT_REACHED", HTTP_UNPROCESSABLE);
    const level = await parseLevel(request);
    if (level === null) return errorOf("MAP_INVALID", HTTP_UNPROCESSABLE);
    const id = `custom-${state.count + 1}`;
    const saved: CustomLevel = { id, level, updatedAt: new Date().toISOString() };
    save({ levels: [saved, ...state.levels], count: state.count + 1 });
    return HttpResponse.json(saved, { status: HTTP_CREATED });
  }),
  http.put(mockUrl("/levels/custom/:id"), async ({ request, params }) => {
    const id = String(params.id);
    if (!state.levels.some((entry) => entry.id === id)) return errorOf("NOT_FOUND", HTTP_NOT_FOUND);
    const level = await parseLevel(request);
    if (level === null) return errorOf("MAP_INVALID", HTTP_UNPROCESSABLE);
    const saved: CustomLevel = { id, level, updatedAt: new Date().toISOString() };
    save({ ...state, levels: [saved, ...state.levels.filter((entry) => entry.id !== id)] });
    return HttpResponse.json(saved);
  }),
  http.delete(mockUrl("/levels/custom/:id"), ({ params }) => {
    save({ ...state, levels: state.levels.filter((entry) => entry.id !== String(params.id)) });
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
];
