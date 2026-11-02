import { forgotEmailSchema } from "./forgot-email-schema";

describe("forgotEmailSchema", () => {
  test("accepts an e-mail and trims it", () => {
    expect(forgotEmailSchema.parse({ email: "  nova@mail.ru " })).toEqual({
      email: "nova@mail.ru",
    });
  });

  test("needs an e-mail", () => {
    expect(forgotEmailSchema.safeParse({ email: "nova" }).error?.issues[0]?.message).toBe(
      "account.errors.email",
    );
  });
});
