import { z } from "zod";

import { passwordScore } from "./password-strength";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MIN_SCORE = 2;

export const strongPassword = z
  .string()
  .refine(
    (password) =>
      password.length >= PASSWORD_MIN_LENGTH && passwordScore(password) >= PASSWORD_MIN_SCORE,
    "account.errors.passwordWeak",
  );
