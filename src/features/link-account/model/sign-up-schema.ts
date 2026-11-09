import { z } from "zod";

import { NICKNAME_CHARS, NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH } from "@entities/wallet";

import { strongPassword } from "./strong-password";
import { emailField } from "./email-field";

export const signUpSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(NICKNAME_MIN_LENGTH, "account.errors.nicknameLength")
    .max(NICKNAME_MAX_LENGTH, "account.errors.nicknameLength")
    .regex(NICKNAME_CHARS, "account.errors.nicknameChars"),
  email: emailField,
  password: strongPassword,
  isConsentGiven: z.boolean().refine(Boolean, "account.errors.consent"),
  isMarketingAllowed: z.boolean(),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
