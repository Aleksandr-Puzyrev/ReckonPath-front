import { changeEmailSchema } from "./change-email-schema";

describe("changeEmailSchema", () => {
  test("accepts a new e-mail with the password", () => {
    expect(changeEmailSchema.safeParse({ email: "nova@mail.ru", password: "x" }).success).toBe(
      true,
    );
  });

  test("needs the password", () => {
    const result = changeEmailSchema.safeParse({ email: "nova@mail.ru", password: "" });

    expect(result.error?.issues[0]?.message).toBe("account.errors.passwordShort");
  });
});
