import { passwordConfirmSchema } from "./password-confirm-schema";

describe("passwordConfirmSchema", () => {
  test("accepts any entered password; the server checks it", () => {
    expect(passwordConfirmSchema.safeParse({ password: "secret" }).success).toBe(true);
  });

  test("needs a password", () => {
    expect(passwordConfirmSchema.safeParse({ password: "" }).success).toBe(false);
  });
});
