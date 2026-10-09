import { signInSchema } from "./sign-in-schema";

const errorOf = (login: string, password: string) =>
  signInSchema.safeParse({ login, password }).error?.issues[0]?.message;

describe("signInSchema", () => {
  test("accepts a nickname or e-mail with a 6-character password", () => {
    expect(signInSchema.safeParse({ login: "Nova_58", password: "123456" }).success).toBe(true);
  });

  test("requires the login", () => {
    expect(errorOf("  ", "123456")).toBe("account.errors.loginRequired");
  });

  test("requires at least 6 password characters", () => {
    expect(errorOf("Nova_58", "12345")).toBe("account.errors.passwordShort");
  });
});
