import { z } from "zod";

import { strongPassword } from "./strong-password";
import { emailField } from "./email-field";

export const NICKNAME_MAX_LENGTH = 16;
const NICKNAME_MIN_LENGTH = 3;

export const signUpSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(NICKNAME_MIN_LENGTH, "account.errors.nicknameLength")
    .max(NICKNAME_MAX_LENGTH, "account.errors.nicknameLength")
    .regex(/^[\wа-яА-ЯёЁ]+$/, "account.errors.nicknameChars"),
  email: emailField,
  password: strongPassword,
  isConsentGiven: z.boolean().refine(Boolean, "account.errors.consent"),
  isMarketingAllowed: z.boolean(),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
