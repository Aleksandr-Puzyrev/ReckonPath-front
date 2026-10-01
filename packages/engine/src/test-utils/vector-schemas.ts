import { z } from "zod";

import { levelSchema } from "../level/level-schema";

export type VectorRunner = (raw: unknown) => void;

export const cellSchema = z.tuple([z.number().int(), z.number().int()]);

const pvpLimitsSchema = z.partialRecord(
  z.enum(["fences", "streams", "heavy", "rocks", "bridges", "bombs"]),
  z.number().int(),
);

export const contextSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("campaign") }),
  z.object({ kind: z.literal("custom") }),
  z.object({ kind: z.literal("daily") }),
  z.object({
    kind: z.literal("pvp"),
    format: z.object({ size: z.number(), targets: z.number(), limits: pvpLimitsSchema }),
  }),
]);

export const levelVectorSchema = z.object({ level: levelSchema });
