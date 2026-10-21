import { nicknameConfirmSchema } from "./nickname-confirm-schema";

describe("nicknameConfirmSchema", () => {
  const schema = nicknameConfirmSchema("Капитан Нова");

  test("accepts the player's own nickname", () => {
    expect(schema.safeParse({ nickname: " Капитан Нова " }).success).toBe(true);
  });

  test("refuses another nickname with the mismatch text (design 26.4)", () => {
    const result = schema.safeParse({ nickname: "Капитан" });

    expect(result.error?.issues[0]?.message).toBe("settings.delete.mismatch");
  });
});
