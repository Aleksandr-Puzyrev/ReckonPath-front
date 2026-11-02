import { z } from "zod";

import { EMAIL_CODE_LENGTH } from "./email-code-schema";
import { strongPassword } from "./strong-password";

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), "errors.invalid_code"),
  password: strongPassword,
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
