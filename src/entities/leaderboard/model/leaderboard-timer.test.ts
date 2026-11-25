import { i18n } from "@shared/i18n";

import { leaderboardTimerOf } from "./leaderboard-timer";

const NOW = Date.parse("2026-11-25T10:00:00.000Z");
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const endsIn = (ms: number) => new Date(NOW + ms).toISOString();

describe("leaderboardTimerOf (decision 0066 #14)", () => {
  describe("in Russian", () => {
    beforeAll(() => i18n.changeLanguage("ru"));

    test("counts days and hours to the weekly reset", () => {
      const endsAt = endsIn(3 * DAY_MS + 14 * HOUR_MS + 5 * MINUTE_MS);

      expect(leaderboardTimerOf("week", endsAt, NOW, i18n.t)).toBe("обнуление через 3д 14ч");
    });

    test("counts hours and minutes under a day to the weekly reset", () => {
      const endsAt = endsIn(5 * HOUR_MS + 7 * MINUTE_MS);

      expect(leaderboardTimerOf("week", endsAt, NOW, i18n.t)).toBe("обнуление через 5ч 7м");
    });

    test("counts the started days left in the season", () => {
      const endsAt = endsIn(4 * DAY_MS + 2 * HOUR_MS);

      expect(leaderboardTimerOf("season", endsAt, NOW, i18n.t)).toBe("сезон: ещё 5 дн.");
    });

    test("counts hours and minutes under a day in the season", () => {
      const endsAt = endsIn(3 * HOUR_MS + 20 * MINUTE_MS);

      expect(leaderboardTimerOf("season", endsAt, NOW, i18n.t)).toBe("сезон: ещё 3ч 20м");
    });

    test("stops at zero after the end", () => {
      expect(leaderboardTimerOf("week", endsIn(-HOUR_MS), NOW, i18n.t)).toBe(
        "обнуление через 0ч 0м",
      );
    });
  });

  describe("in English", () => {
    beforeAll(() => i18n.changeLanguage("en"));
    afterAll(() => i18n.changeLanguage("ru"));

    test("uses the singular for one day left in the season", () => {
      expect(leaderboardTimerOf("season", endsIn(DAY_MS), NOW, i18n.t)).toBe("season: 1 day left");
    });

    test("uses the plural for several days left in the season", () => {
      expect(leaderboardTimerOf("season", endsIn(12 * DAY_MS), NOW, i18n.t)).toBe(
        "season: 12 days left",
      );
    });

    test("counts days and hours to the weekly reset", () => {
      const endsAt = endsIn(2 * DAY_MS + 3 * HOUR_MS);

      expect(leaderboardTimerOf("week", endsAt, NOW, i18n.t)).toBe("resets in 2d 3h");
    });

    test("counts hours and minutes under a day", () => {
      const endsAt = endsIn(HOUR_MS + 45 * MINUTE_MS);

      expect(leaderboardTimerOf("season", endsAt, NOW, i18n.t)).toBe("season: 1h 45m left");
    });
  });
});
