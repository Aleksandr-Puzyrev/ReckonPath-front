import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import {
  DEFAULT_EDITOR_CAPS,
  findDryBridges,
  levelFromBackend,
  MAX_BOARD_SIZE,
  MAX_MOVE_LIMIT,
  MIN_BOARD_SIZE,
  overEditorCap,
  TITLE_MAX_LENGTH,
  validateLevel,
} from "@reckon-path/engine";
import type { EditorElement, LevelInput, ValidationError } from "@reckon-path/engine";

import type { components } from "../generated/schema";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type Schemas = components["schemas"];
type CustomLevelView = Schemas["CustomLevelView"];
type GameLevel = Schemas["GameLevel"];
type LevelProblem = Schemas["LevelProblem"];

const STATE_NAME = "my-levels";
// The levels of the old mock contract are dropped, not migrated (decision 0063 #15) (уровни старого мок-контракта удаляются, а не переносятся).
const OLD_STATE_NAME = "custom-levels";
const MAX_LEVELS = 20;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;

interface MyLevelsState {
  levels: CustomLevelView[];
  count: number;
}

const START_STATE: MyLevelsState = { levels: [], count: 0 };

const cellSchema = z.tuple([z.number().int(), z.number().int()]);
const cellsSchema = z.array(cellSchema).optional();
// Strict like the backend's DisallowUnknownFields (строго, как DisallowUnknownFields бэкенда).
const levelSchema = z.strictObject({
  rows: z.number().int(),
  cols: z.number().int(),
  terrain: z.array(z.string()),
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
  beacons: cellsSchema,
  targets: z.array(cellSchema),
  bombs: cellsSchema,
  buoys: cellsSchema,
  mode: z.enum(["number", "hot_cold", "course"]),
  fog: z.number().int().optional(),
  order: z.boolean().optional(),
  noBombHint: z.boolean().optional(),
  limit: z.number().int(),
  stars: z.tuple([z.number().int(), z.number().int()]),
  caps: z.unknown().optional(),
});
const requestSchema = z.strictObject({ title: z.string().optional(), level: levelSchema });

// The backend's problem codes (game.Validate, game.CheckEditor) (коды проблем бэкенда).
const PROBLEM_CODES: Record<ValidationError["code"], string> = {
  SIZE: "size",
  OUT_OF_BOUNDS: "targets",
  DUPLICATE: "targets",
  FENCE_NOT_ADJACENT: "fences",
  NOT_CONNECTED: "cut",
  TARGET_COUNT: "targets",
  TARGET_ON_ROCK: "targets",
  BOMB_ON_ROCK: "bombs",
  BOMB_ON_TARGET: "bombs",
  BRIDGE_NOT_ON_STREAM: "bridge",
  TOO_MANY_BOMBS: "bombs_limit",
  TOO_MANY_ROCKS: "rocks_limit",
  ELEMENT_LIMIT: "caps",
  BEACON_ON_HIDDEN: "beacons",
  BEACON_ON_ROCK: "beacons",
  BEACON_LIMIT: "beacons_limit",
  BUOY_OVERLAP: "buoys",
  BUOY_LIMIT: "buoys_limit",
  FOG_RANGE: "fog_range",
  ORDER_SINGLE_TARGET: "order",
  FEATURE_IN_PVP: "elements",
};
const CAP_KEYS: Record<EditorElement, string> = {
  targets: "targets",
  fences: "fences",
  streams: "stream",
  heavy: "heavy",
  rocks: "rock",
  bridges: "bridge",
  bombs: "bombs",
  beacons: "beacons",
  buoys: "buoys",
};

let state = loadMockState<MyLevelsState>(STATE_NAME, START_STATE);
clearMockState(OLD_STATE_NAME);

export const resetMockCustomLevels = () => {
  state = START_STATE;
  clearMockState(STATE_NAME);
};

const save = (next: MyLevelsState) => {
  state = next;
  saveMockState(STATE_NAME, state);
};

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, details } }, { status });

const problemOf = (error: ValidationError): LevelProblem => ({
  code: PROBLEM_CODES[error.code],
  message: error.code,
  ...("cells" in error
    ? { cells: error.cells.map(([row, col]): [number, number] => [row, col]) }
    : {}),
  ...("max" in error ? { max: error.max } : {}),
  ...(error.code === "TARGET_COUNT" && typeof error.expected !== "number"
    ? { min: error.expected.min, max: error.expected.max, count: error.actual }
    : {}),
});

const areStarsValid = ({ limit, stars: [three, two] }: GameLevel) =>
  limit === 0 ||
  (three !== undefined && two !== undefined && three >= 1 && three <= two && two <= limit);

const editorProblemsOf = (input: LevelInput): LevelProblem[] => {
  const overCap = overEditorCap(input, DEFAULT_EDITOR_CAPS);
  return [
    ...(overCap === null
      ? []
      : [
          {
            code: "caps",
            message: "caps",
            element: CAP_KEYS[overCap.element],
            max: overCap.max,
            count: overCap.count,
          },
        ]),
    ...findDryBridges(input).map(([row, col]): LevelProblem => ({
      code: "bridge",
      message: "bridge",
      cells: [[row, col]],
    })),
  ];
};

const problemsOf = (level: GameLevel): LevelProblem[] => {
  const input = levelFromBackend(level, "u-mock");
  return [
    ...(level.limit < 0 || level.limit > MAX_MOVE_LIMIT
      ? [{ code: "limit", message: "limit", max: MAX_MOVE_LIMIT }]
      : []),
    ...(areStarsValid(level) ? [] : [{ code: "stars", message: "stars" }]),
    ...validateLevel(input, { kind: "custom" }).map(problemOf),
    ...editorProblemsOf(input),
  ];
};

const isSizeValid = (size: number) => size >= MIN_BOARD_SIZE && size <= MAX_BOARD_SIZE;

const checkRequest = async (request: Request) => {
  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("validation_failed", HTTP_UNPROCESSABLE);
  const title = (body.data.title ?? "").trim();
  // The backend accepts a level's own caps and drops them (бэкенд принимает собственные лимиты уровня и отбрасывает их).
  const { caps: _caps, ...level } = body.data.level;
  if (
    [...title].length > TITLE_MAX_LENGTH ||
    !isSizeValid(level.rows) ||
    !isSizeValid(level.cols)
  ) {
    return errorResponse("validation_failed", HTTP_UNPROCESSABLE);
  }
  const problems = problemsOf(level);
  if (problems.length > 0) return errorResponse("level_invalid", HTTP_UNPROCESSABLE, { problems });
  return { title, level };
};

const findLevel = (id: string) => state.levels.find((entry) => entry.id === id);

const notFound = () => errorResponse("level_not_found", HTTP_NOT_FOUND);

export const customLevelHandlers = [
  http.get(mockUrl("/levels/custom"), () =>
    HttpResponse.json({ levels: state.levels, max: MAX_LEVELS }),
  ),
  http.get(mockUrl("/levels/custom/:id"), ({ params }) => {
    const level = findLevel(String(params.id));
    return level === undefined ? notFound() : HttpResponse.json(level);
  }),
  http.post(mockUrl("/levels/custom"), async ({ request }) => {
    const checked = await checkRequest(request);
    if (checked instanceof Response) return checked;
    if (state.levels.length >= MAX_LEVELS) {
      return errorResponse("limit_reached", HTTP_CONFLICT, { max: MAX_LEVELS });
    }
    const saved = {
      id: `level-${state.count + 1}`,
      ...checked,
      updatedAt: new Date().toISOString(),
    };
    save({ levels: [saved, ...state.levels], count: state.count + 1 });
    return HttpResponse.json(saved);
  }),
  http.put(mockUrl("/levels/custom/:id"), async ({ request, params }) => {
    const id = String(params.id);
    const checked = await checkRequest(request);
    if (checked instanceof Response) return checked;
    if (findLevel(id) === undefined) return notFound();
    const saved = { id, ...checked, updatedAt: new Date().toISOString() };
    save({ ...state, levels: [saved, ...state.levels.filter((entry) => entry.id !== id)] });
    return HttpResponse.json(saved);
  }),
  http.delete(mockUrl("/levels/custom/:id"), ({ params }) => {
    const id = String(params.id);
    if (findLevel(id) === undefined) return notFound();
    save({ ...state, levels: state.levels.filter((entry) => entry.id !== id) });
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
];
