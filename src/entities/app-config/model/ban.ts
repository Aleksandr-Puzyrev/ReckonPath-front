import { z } from "zod";

import { isApiError } from "@shared/api";

const banSchema = z.object({
  scope: z.enum(["all", "arena"]).catch("all"),
  until: z.string().nullable().catch(null),
  reason: z.string().catch(""),
});

export type Ban = z.infer<typeof banSchema>;

export const banOfDetails = (details: unknown): Ban =>
  banSchema.parse(typeof details === "object" && details !== null ? details : {});

export const banOf = (error: unknown): Ban | null =>
  isApiError(error) && error.code === "BANNED" ? banOfDetails(error.details) : null;
