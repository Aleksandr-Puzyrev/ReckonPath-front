import { z } from "zod";

const color = z.string();
const colorStops = z.array(color).min(2);

const themeSkinSchema = z.object({
  frame: z.object({ gradient: z.tuple([color, color]) }).optional(),
  cell: z.object({ stops: z.tuple([color, color, color]) }).optional(),
  number: color.optional(),
  elements: z.record(z.string(), z.union([color, colorStops])).optional(),
});

// The subset of skin.schema.json the client draws now, decision 0024 #1 (часть skin.schema.json, которую клиент рисует сейчас, решение 0024 #1).
export const skinDataSchema = z.object({
  light: themeSkinSchema.optional(),
  dark: themeSkinSchema.optional(),
});

export type SkinData = z.infer<typeof skinDataSchema>;
export type ThemeSkin = z.infer<typeof themeSkinSchema>;
