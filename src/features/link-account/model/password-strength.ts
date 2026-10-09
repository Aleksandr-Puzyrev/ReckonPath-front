export type PasswordStrength = "weak" | "fair" | "good" | "strong";

const MIN_STRONG_LENGTH = 8;
const STRENGTH_BY_SCORE: readonly PasswordStrength[] = ["weak", "weak", "fair", "good", "strong"];

export const passwordScore = (password: string) =>
  [
    password.length >= MIN_STRONG_LENGTH,
    /[A-ZА-ЯЁ]/.test(password) && /[a-zа-яё]/.test(password),
    /\d/.test(password),
    /[^\wа-яА-ЯёЁ]/.test(password),
  ].filter(Boolean).length;

export const passwordStrength = (password: string): PasswordStrength =>
  STRENGTH_BY_SCORE[passwordScore(password)] ?? "weak";
