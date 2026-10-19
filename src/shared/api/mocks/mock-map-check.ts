import {
  computeNorm,
  createBoard,
  generateRandomPvpMap,
  PVP_SOLVER_BOMB_PENALTY,
  rngFromKey,
  validateLevel,
  validateLevelNorm,
} from "@reckon-path/engine";
import type { Cell, LevelInput, PvpFormat, ValidationError } from "@reckon-path/engine";

import type { components } from "../generated/schema";

type ArenaFormat = components["schemas"]["ArenaFormat"];
type PvpMap = components["schemas"]["PvpMap"];
type MapError = components["schemas"]["MapError"];

const LEVEL_ID = "u-arena-map";
// The real median comes from remote config (Part 6 §6.3); any value still yields a valid map (настоящая медиана приходит из remote config; с любым значением карта всё равно валидна).
const MOCK_MEDIAN_NORM = 6;

let randomCount = 0;

export const resetMockMapCheck = () => {
  randomCount = 0;
};

const pvpFormatOf = ({ size, targets, limits }: ArenaFormat): PvpFormat => ({
  size,
  targets,
  limits: {
    fences: limits.fence,
    streams: limits.stream,
    heavy: limits.heavy,
    rocks: limits.rock,
    bridges: limits.bridge,
    bombs: limits.bomb,
  },
});

const levelOf = (map: PvpMap): LevelInput => ({
  ...map,
  v: 2,
  id: LEVEL_ID,
  probeMode: "distance",
});

const mapOf = ({
  rows,
  cols,
  targets,
  bombs,
  streams,
  bridges,
  heavy,
  rocks,
  fences,
}: LevelInput) => ({
  rows,
  cols,
  targets,
  bombs,
  streams,
  bridges,
  heavy,
  rocks,
  fences,
});

const copyCell = ([row, col]: Cell): [number, number] => [row, col];

const mapErrorOf = (error: ValidationError): MapError => {
  if ("cells" in error) return { code: error.code, cells: error.cells.map(copyCell) };
  if ("edge" in error) return { code: error.code, cells: error.edge.map(copyCell) };
  return { code: error.code, cells: [] };
};

const normOf = (level: LevelInput) => {
  const { board, rules } = createBoard(level);
  return computeNorm(board, rules, level.id, PVP_SOLVER_BOMB_PENALTY);
};

export const checkMockMap = (format: ArenaFormat, map: PvpMap) => {
  const level = levelOf(map);
  const context = { kind: "pvp" as const, format: pvpFormatOf(format) };
  const errors = validateLevel(level, context).map(mapErrorOf);
  if (errors.length > 0) return { valid: false, errors, botNorm: null };
  const norm = normOf(level);
  const normErrors = validateLevelNorm(level, context, norm).map(({ code }) => ({
    code,
    cells: [],
  }));
  return {
    valid: normErrors.length === 0,
    errors: normErrors,
    botNorm: normErrors.length === 0 ? Math.round(norm.norm) : null,
  };
};

export const randomMockMap = (format: ArenaFormat) => {
  randomCount += 1;
  const random = generateRandomPvpMap({
    format: pvpFormatOf(format),
    rng: rngFromKey(`random-${randomCount}`),
    medianNorm: MOCK_MEDIAN_NORM,
    levelId: LEVEL_ID,
  });
  return random === null
    ? null
    : { map: mapOf(random.level), botNorm: Math.round(random.norm.norm) };
};
