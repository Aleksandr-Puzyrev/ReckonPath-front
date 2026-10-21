import { SUPPORT_MESSAGE_MAX, supportSchema } from "./support-schema";

describe("supportSchema", () => {
  test("accepts a message and trims it", () => {
    expect(supportSchema.parse({ message: "  Not me  " })).toEqual({ message: "Not me" });
  });

  test("refuses an empty or a too long message (decision 0038 #5)", () => {
    expect(supportSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(supportSchema.safeParse({ message: "a".repeat(SUPPORT_MESSAGE_MAX + 1) }).success).toBe(
      false,
    );
  });
});
