import { changePasswordSchema } from "./change-password-schema";

describe("changePasswordSchema", () => {
  test("accepts the current password and a strong new one", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "old", newPassword: "Signal2026" }).success,
    ).toBe(true);
  });

  test("rejects a weak new password", () => {
    const result = changePasswordSchema.safeParse({ currentPassword: "old", newPassword: "aaa" });

    expect(result.error?.issues[0]?.message).toBe("account.errors.passwordWeak");
  });
});
