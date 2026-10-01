import { xpFor } from "./rewards";

describe("xpFor", () => {
  test.each([
    ["levelFirstWin", 10],
    ["levelRepeatWin", 2],
    ["daily", 15],
    ["match", 5],
    ["matchWin", 5],
  ] as const)("gives %s %i XP", (source, xp) => {
    expect(xpFor(source)).toBe(xp);
  });
});
