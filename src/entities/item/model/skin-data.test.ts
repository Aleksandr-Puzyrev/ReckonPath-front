import { skinDataSchema } from "./skin-data";

describe("skinDataSchema", () => {
  test("accepts a board skin and an element skin", () => {
    const board = {
      frame: { gradient: ["a", "b"] },
      cell: { stops: ["c", "d", "e"] },
      number: "f",
    };

    expect(skinDataSchema.safeParse({ light: board, dark: board }).success).toBe(true);
    expect(
      skinDataSchema.safeParse({ dark: { elements: { fence: "g", stream: ["h", "i"] } } }).success,
    ).toBe(true);
  });

  test("refuses cells with a wrong number of stops", () => {
    expect(skinDataSchema.safeParse({ dark: { cell: { stops: ["a", "b"] } } }).success).toBe(false);
  });

  test("refuses a non-colour element value", () => {
    expect(skinDataSchema.safeParse({ dark: { elements: { fence: 5 } } }).success).toBe(false);
  });
});
