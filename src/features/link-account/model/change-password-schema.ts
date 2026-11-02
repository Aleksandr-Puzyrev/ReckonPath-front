import { z } from "zod";

import { strongPassword } from "./strong-password";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "account.errors.passwordShort"),
  newPassword: strongPassword,
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
