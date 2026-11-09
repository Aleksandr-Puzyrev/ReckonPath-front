import { nicknameSchema } from "./nickname-schema";

const errorOf = (nickname: string) =>
  nicknameSchema.safeParse({ nickname }).error?.issues[0]?.message;

describe("nicknameSchema", () => {
  test.each(["Nova", "Seeker_7", "abc", "a".repeat(16)])("accepts %s", (nickname) => {
    expect(errorOf(nickname)).toBeUndefined();
  });

  test("trims the spaces around the nickname", () => {
    expect(nicknameSchema.parse({ nickname: "  Nova  " }).nickname).toBe("Nova");
  });

  test("asks for at least 3 characters", () => {
    expect(errorOf("ab")).toBe("nick.short");
  });

  test.each(["Nova!", "Nova 58", "Пеленг"])("rejects the characters of %s", (nickname) => {
    expect(errorOf(nickname)).toBe("nick.invalid");
  });

  test("rejects a nickname longer than 16 characters", () => {
    expect(errorOf("a".repeat(17))).toBe("nick.invalid");
  });
});
