import { resetPasswordSchema } from "./reset-password-schema";

const messageOf = (code: string, password: string) =>
  resetPasswordSchema.safeParse({ code, password }).error?.issues[0]?.message;

describe("resetPasswordSchema", () => {
  test("accepts a six-digit code and a strong password", () => {
    expect(resetPasswordSchema.safeParse({ code: "123456", password: "Signal2026" }).success).toBe(
      true,
    );
  });

  test("rejects a wrong-looking code", () => {
    expect(messageOf("12", "Signal2026")).toBe("errors.invalid_code");
  });

  test("rejects a weak password", () => {
    expect(messageOf("123456", "aaaaaaaa")).toBe("account.errors.passwordWeak");
  });
});
