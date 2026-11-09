import { nicknameNoteOf } from "./nickname-note";

const NOW = Date.parse("2026-11-09T12:00:00Z");

describe("nicknameNoteOf (Part 11 ACC-12)", () => {
  test("makes the first change free", () => {
    expect(nicknameNoteOf({ price: 0, currency: "gems" }, NOW)).toEqual({ kind: "free" });
  });

  test("charges the next change", () => {
    expect(nicknameNoteOf({ price: 100, currency: "gems" }, NOW)).toEqual({
      kind: "paid",
      price: 100,
    });
  });

  test("waits for the date of the next change", () => {
    const availableAt = "2026-12-01T12:00:00Z";

    expect(nicknameNoteOf({ price: 100, currency: "gems", availableAt }, NOW)).toEqual({
      kind: "cooldown",
      availableAt,
    });
  });

  test("charges again once the date has passed", () => {
    const availableAt = "2026-11-01T12:00:00Z";

    expect(nicknameNoteOf({ price: 100, currency: "gems", availableAt }, NOW)).toEqual({
      kind: "paid",
      price: 100,
    });
  });
});
