import { z } from "zod";

export const passwordConfirmSchema = z.object({
  password: z.string().min(1, "account.errors.passwordShort"),
});

export type PasswordConfirmSchema = z.infer<typeof passwordConfirmSchema>;
