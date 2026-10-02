import { CAMPAIGN_LEVELS } from "@entities/level";

import { resolvePlayLevel } from "./resolve-play-level";

const NOW = Date.UTC(2026, 9, 2, 12);
const UNLOCKED = Object.fromEntries(
  CAMPAIGN_LEVELS.slice(0, 6).map(({ level }) => [level.id, { stars: 3 as const, moves: 5 }]),
);

const context = (overrides: Partial<Parameters<typeof resolvePlayLevel>[2]> = {}) => ({
  best: UNLOCKED,
  now: NOW,
  savedLevelId: null,
  dailyOverride: () => null,
  ...overrides,
});

describe("resolvePlayLevel", () => {
  test("opens today's daily", () => {
    expect(resolvePlayLevel("daily", "d-2026-10-02", context())).toMatchObject({
      kind: "daily",
      dayKey: "2026-10-02",
      level: { id: "d-2026-10-02" },
    });
  });

  test("does not open another day's daily", () => {
    expect(resolvePlayLevel("daily", "d-2026-10-01", context()).kind).toBe("missing");
  });

  test("lets a game started yesterday be finished (DLY-03)", () => {
    const play = resolvePlayLevel(
      "daily",
      "d-2026-10-01",
      context({ savedLevelId: "d-2026-10-01" }),
    );

    expect(play.kind).toBe("daily");
  });

  test("keeps the daily closed before campaign level 6", () => {
    expect(resolvePlayLevel("daily", "d-2026-10-02", context({ best: {} })).kind).toBe(
      "dailyLocked",
    );
  });

  test("tells which level opens a locked campaign level", () => {
    const sixth = CAMPAIGN_LEVELS[5]?.level.id ?? "";

    expect(resolvePlayLevel("campaign", sixth, context({ best: {} }))).toEqual({
      kind: "locked",
      lockedBy: 1,
    });
  });

  test("knows nothing of other modes", () => {
    expect(resolvePlayLevel("event", "e-1", context()).kind).toBe("missing");
  });
});
