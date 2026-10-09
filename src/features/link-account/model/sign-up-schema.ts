import { z } from "zod";

import { passwordScore } from "./password-strength";

export const NICKNAME_MAX_LENGTH = 16;
const NICKNAME_MIN_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MIN_SCORE = 2;

export const signUpSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(NICKNAME_MIN_LENGTH, "account.errors.nicknameLength")
    .max(NICKNAME_MAX_LENGTH, "account.errors.nicknameLength")
    .regex(/^[\wа-яА-ЯёЁ]+$/, "account.errors.nicknameChars"),
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "account.errors.email"),
  password: z
    .string()
    .refine(
      (password) =>
        password.length >= PASSWORD_MIN_LENGTH && passwordScore(password) >= PASSWORD_MIN_SCORE,
      "account.errors.passwordWeak",
    ),
  isConsentGiven: z.boolean().refine(Boolean, "account.errors.consent"),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
