import { z } from "zod";

import { emailField } from "./email-field";

export const forgotEmailSchema = z.object({
  email: emailField,
});

export type ForgotEmailSchema = z.infer<typeof forgotEmailSchema>;
