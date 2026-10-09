import { z } from "zod";

const MIN_PASSWORD_LENGTH = 6;

export const signInSchema = z.object({
  login: z.string().trim().min(1, "account.errors.loginRequired"),
  password: z.string().min(MIN_PASSWORD_LENGTH, "account.errors.passwordShort"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
