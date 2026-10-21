import { z } from "zod";

export const APPEAL_MAX_LENGTH = 1000;

export const appealSchema = z.object({
  message: z.string().trim().min(1).max(APPEAL_MAX_LENGTH),
});

export type AppealSchema = z.infer<typeof appealSchema>;
