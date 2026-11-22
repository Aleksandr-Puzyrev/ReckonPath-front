import { challengeViewMock, incomingChallengeMock } from "@shared/test-utils/api-mock";

import { bannerChallengeOf } from "./banner-challenge-of";

const NOW = Date.parse("2026-11-17T12:00:00Z");
const SECOND_MS = 1000;

const challengeAt = (id: string, secondsLeft: number, status: "pending" | "expired" = "pending") =>
  challengeViewMock(
    incomingChallengeMock({
      id,
      status,
      expiresAt: new Date(NOW + secondsLeft * SECOND_MS).toISOString(),
    }),
  );

describe("bannerChallengeOf", () => {
  test("shows the newest pending challenge first (decision 0062 #23)", () => {
    const list = [challengeAt("old", 10), challengeAt("new", 50), challengeAt("mid", 30)];

    expect(bannerChallengeOf(list, NOW)?.id).toBe("new");
  });

  test("moves on to the next one once the newest is gone", () => {
    const list = [challengeAt("old", 10), challengeAt("new", 50, "expired")];

    expect(bannerChallengeOf(list, NOW)?.id).toBe("old");
  });

  test("skips a challenge whose time ran out before the server said so", () => {
    expect(bannerChallengeOf([challengeAt("late", -1)], NOW)).toBeNull();
  });

  test("shows nothing without challenges", () => {
    expect(bannerChallengeOf([], NOW)).toBeNull();
  });
});
