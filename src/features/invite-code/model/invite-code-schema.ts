import { z } from "zod";

export const INVITE_CODE_MAX_LENGTH = 16;

export const inviteCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "errors.invite_invalid")
    .max(INVITE_CODE_MAX_LENGTH, "errors.invite_invalid"),
});

export type InviteCodeSchema = z.infer<typeof inviteCodeSchema>;
