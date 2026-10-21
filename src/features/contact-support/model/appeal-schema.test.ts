import { APPEAL_MAX_LENGTH, appealSchema } from "./appeal-schema";

describe("appealSchema", () => {
  test("accepts a message and trims it", () => {
    expect(appealSchema.parse({ message: "  Not me  " })).toEqual({ message: "Not me" });
  });

  test("refuses an empty or a too long message (decision 0038 #5)", () => {
    expect(appealSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(appealSchema.safeParse({ message: "a".repeat(APPEAL_MAX_LENGTH + 1) }).success).toBe(
      false,
    );
  });
});
