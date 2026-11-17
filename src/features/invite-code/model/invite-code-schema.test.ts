import { inviteCodeSchema } from "./invite-code-schema";

const errorOf = (code: string) => inviteCodeSchema.safeParse({ code }).error?.issues[0]?.message;

describe("inviteCodeSchema", () => {
  test("accepts a code and trims the spaces around it", () => {
    expect(inviteCodeSchema.parse({ code: "  K7M2QX9A " }).code).toBe("K7M2QX9A");
  });

  test("rejects an empty code", () => {
    expect(errorOf("   ")).toBe("errors.invite_invalid");
  });

  test("rejects a code longer than 16 characters", () => {
    expect(errorOf("A".repeat(17))).toBe("errors.invite_invalid");
  });
});
