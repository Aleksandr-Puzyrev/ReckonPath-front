import { z } from "zod";

import {
  MAX_BOARD_SIZE,
  MAX_BOMBS,
  MAX_CELL_COORDINATE,
  MAX_MOVE_LIMIT,
  MAX_TARGETS,
  MAX_WORLD,
  MIN_BOARD_SIZE,
  MIN_TARGETS,
  TITLE_MAX_LENGTH,
} from "../config/engine-config";
import { cellKey } from "../grid/grid";

const coordinateSchema = z.number().int().min(0).max(MAX_CELL_COORDINATE);
const cellSchema = z.tuple([coordinateSchema, coordinateSchema]);
const sizeSchema = z.number().int().min(MIN_BOARD_SIZE).max(MAX_BOARD_SIZE);

const cellsSchema = z
  .array(cellSchema)
  .refine((cells) => new Set(cells.map(cellKey)).size === cells.length, "Cells must be unique");

const localizedTitleSchema = z.object({
  ru: z.string().max(TITLE_MAX_LENGTH).optional(),
  en: z.string().max(TITLE_MAX_LENGTH).optional(),
});

export const levelSchema = z.object({
  v: z.literal(2),
  id: z.string().regex(/^(c|d|e|u)-[a-z0-9-]{1,40}$/),
  title: localizedTitleSchema.optional(),
  world: z.number().int().min(1).max(MAX_WORLD).optional(),
  rows: sizeSchema,
  cols: sizeSchema,
  targets: cellsSchema.min(MIN_TARGETS).max(MAX_TARGETS),
  bombs: cellsSchema.max(MAX_BOMBS).optional(),
  streams: cellsSchema.optional(),
  bridges: cellsSchema.optional(),
  heavy: cellsSchema.optional(),
  rocks: cellsSchema.optional(),
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
  beacons: cellsSchema.optional(),
  buoys: cellsSchema.optional(),
  targetOrder: z.boolean().optional(),
  fog: z.number().int().nullable().optional(),
  probeMode: z.enum(["distance", "direction", "hotcold"]),
  moveLimit: z.number().int().min(1).max(MAX_MOVE_LIMIT).nullable().optional(),
  stars: z.tuple([z.number().int(), z.number().int()]).nullable().optional(),
  bombHint: z.boolean().optional(),
  introduces: z
    .enum(["fence", "stream", "multi", "bomb", "rock", "heavy", "bridge", "direction", "hotcold"])
    .nullable()
    .optional(),
});

export type LevelInput = z.infer<typeof levelSchema>;
