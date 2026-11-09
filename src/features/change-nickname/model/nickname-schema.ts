import { z } from "zod";

import { NICKNAME_CHARS, NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH } from "@entities/wallet";

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(NICKNAME_MIN_LENGTH, "nick.short")
    .max(NICKNAME_MAX_LENGTH, "nick.invalid")
    .regex(NICKNAME_CHARS, "nick.invalid"),
});

export type NicknameSchema = z.infer<typeof nicknameSchema>;
