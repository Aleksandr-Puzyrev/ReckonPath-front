import { z } from "zod";

import { emailField } from "./email-field";

export const changeEmailSchema = z.object({
  email: emailField,
  password: z.string().min(1, "account.errors.passwordShort"),
});

export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;
