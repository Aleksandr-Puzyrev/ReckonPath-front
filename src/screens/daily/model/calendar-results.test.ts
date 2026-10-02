import { calendarResultsOf } from "./calendar-results";

const record = (result: "won" | "lost") => ({
  attemptId: "a",
  result,
  movesUsed: 7,
  stars: null,
  durationMs: 1,
  rank: null,
  percentile: null,
  ranked: null,
});

describe("calendarResultsOf", () => {
  test("takes the server's days and fills the rest from the device", () => {
    const results = calendarResultsOf(
      [
        { date: "2026-09-26", result: "lost", restored: false },
        { date: "2026-09-25", result: null, restored: true },
      ],
      { "2026-09-26": record("won"), "2026-09-27": record("won") },
    );

    expect(Object.fromEntries(results)).toEqual({
      "2026-09-25": "restored",
      "2026-09-26": "lost",
      "2026-09-27": "won",
    });
  });
});
