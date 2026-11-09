import type { Me } from "@entities/wallet";

export type NicknameNote =
  { kind: "free" } | { kind: "paid"; price: number } | { kind: "cooldown"; availableAt: string };

export const nicknameNoteOf = (
  { price, availableAt }: Me["nicknameChange"],
  now: number,
): NicknameNote => {
  if (availableAt !== undefined && Date.parse(availableAt) > now) {
    return { kind: "cooldown", availableAt };
  }
  return price === 0 ? { kind: "free" } : { kind: "paid", price };
};
