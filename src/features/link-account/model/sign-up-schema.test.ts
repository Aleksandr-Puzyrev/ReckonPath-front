import { signUpSchema } from "./sign-up-schema";

const VALID = {
  nickname: "Seeker_7",
  email: "seeker@reckon.app",
  password: "Signal2026",
  isConsentGiven: true,
};

const errorOf = (input: Partial<typeof VALID>) =>
  signUpSchema.safeParse({ ...VALID, ...input }).error?.issues[0]?.message;

describe("signUpSchema", () => {
  test("accepts a valid sign-up", () => {
    expect(signUpSchema.safeParse(VALID).success).toBe(true);
  });

  test("accepts a Cyrillic nickname", () => {
    expect(errorOf({ nickname: "Капитан_Нова" })).toBeUndefined();
  });

  test.each(["ab", "a".repeat(17)])("rejects the nickname length of %s", (nickname) => {
    expect(errorOf({ nickname })).toBe("account.errors.nicknameLength");
  });

  test("rejects characters other than letters, digits and _", () => {
    expect(errorOf({ nickname: "Nova 58!" })).toBe("account.errors.nicknameChars");
  });

  test("rejects a malformed e-mail", () => {
    expect(errorOf({ email: "seeker@reckon" })).toBe("account.errors.email");
  });

  test("rejects a password shorter than 8 characters", () => {
    expect(errorOf({ password: "Sig2026" })).toBe("account.errors.passwordWeak");
  });

  test("rejects a long password below fair strength", () => {
    expect(errorOf({ password: "signalsignal" })).toBe("account.errors.passwordWeak");
  });

  test("requires the consent", () => {
    expect(errorOf({ isConsentGiven: false })).toBe("account.errors.consent");
  });
});
