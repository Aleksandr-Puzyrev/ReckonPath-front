import { z } from "zod";

export const SUPPORT_MESSAGE_MAX = 1000;

export const supportSchema = z.object({
  message: z.string().trim().min(1).max(SUPPORT_MESSAGE_MAX),
});

export type SupportSchema = z.infer<typeof supportSchema>;
