import { passwordScore, passwordStrength } from "./password-strength";

describe("passwordScore", () => {
  test.each([
    ["", 0],
    ["signalsignal", 1],
    ["Signalsignal", 2],
    ["Signal2026", 3],
    ["Signal-2026", 4],
    ["Сигнал-2026", 4],
  ])("scores %p as %i", (password, score) => {
    expect(passwordScore(password)).toBe(score);
  });
});

describe("passwordStrength", () => {
  test.each([
    ["signal", "weak"],
    ["signalsignal", "weak"],
    ["Signalsignal", "fair"],
    ["Signal2026", "good"],
    ["Signal-2026", "strong"],
  ] as const)("rates %p as %s", (password, strength) => {
    expect(passwordStrength(password)).toBe(strength);
  });
});
