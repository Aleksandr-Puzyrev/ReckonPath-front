import { z } from "zod";

export const nicknameConfirmSchema = (nickname: string) =>
  z.object({
    nickname: z
      .string()
      .trim()
      .refine((value) => value === nickname, "settings.delete.mismatch"),
  });

export type NicknameConfirmSchema = z.infer<ReturnType<typeof nicknameConfirmSchema>>;
