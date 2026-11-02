import { z } from "zod";

import { emailField } from "./email-field";

const MIN_PASSWORD_LENGTH = 6;

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(MIN_PASSWORD_LENGTH, "account.errors.passwordShort"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
