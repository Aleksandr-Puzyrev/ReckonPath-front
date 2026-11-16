import { mockOverview, mockServer, passMockLevels } from "@shared/test-utils/api-mock";

import { dailyUnlockOf } from "./daily-unlock";

describe("dailyUnlockOf", () => {
  afterEach(() => mockServer.reset());

  test("opens the daily by the server's unlock (decision 0060 #5)", () => {
    passMockLevels(6);

    expect(dailyUnlockOf(mockOverview("ru"))).toEqual({ isUnlocked: true, unlockLevel: 6 });
  });

  test("keeps the daily closed before its level", () => {
    passMockLevels(5);

    expect(dailyUnlockOf(mockOverview("ru")).isUnlocked).toBe(false);
  });

  test("stays closed before the campaign is known", () => {
    expect(dailyUnlockOf(undefined)).toEqual({ isUnlocked: false, unlockLevel: 6 });
  });
});
