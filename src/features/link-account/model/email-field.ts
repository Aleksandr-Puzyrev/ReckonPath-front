import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .regex(/^\S+@\S+\.\S+$/, "account.errors.email");
