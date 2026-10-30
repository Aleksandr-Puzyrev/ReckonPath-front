import { z } from "zod";

export const EMAIL_CODE_LENGTH = 6;

export const emailCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), "errors.invalid_code"),
});

export type EmailCodeSchema = z.infer<typeof emailCodeSchema>;
