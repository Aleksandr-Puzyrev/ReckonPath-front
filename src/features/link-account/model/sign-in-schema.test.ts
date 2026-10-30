import { signInSchema } from "./sign-in-schema";

const errorOf = (email: string, password: string) =>
  signInSchema.safeParse({ email, password }).error?.issues[0]?.message;

describe("signInSchema", () => {
  test("accepts an e-mail with a 6-character password", () => {
    expect(signInSchema.safeParse({ email: "nova@mail.ru", password: "123456" }).success).toBe(
      true,
    );
  });

  test("requires an e-mail, not a nickname (decision 0050 #3)", () => {
    expect(errorOf("Nova_58", "123456")).toBe("account.errors.email");
  });

  test("requires at least 6 password characters", () => {
    expect(errorOf("nova@mail.ru", "12345")).toBe("account.errors.passwordShort");
  });
});
