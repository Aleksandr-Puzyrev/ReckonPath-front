import { emailCodeSchema } from "./email-code-schema";

describe("emailCodeSchema", () => {
  test("accepts six digits", () => {
    expect(emailCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  test("rejects a short or non-digit code with the wrong-code text", () => {
    const short = emailCodeSchema.safeParse({ code: "123" });
    const letters = emailCodeSchema.safeParse({ code: "12a456" });

    expect(short.error?.issues[0]?.message).toBe("errors.invalid_code");
    expect(letters.error?.issues[0]?.message).toBe("errors.invalid_code");
  });
});
