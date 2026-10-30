import { z } from "zod";

const MIN_PASSWORD_LENGTH = 6;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "account.errors.email"),
  password: z.string().min(MIN_PASSWORD_LENGTH, "account.errors.passwordShort"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
