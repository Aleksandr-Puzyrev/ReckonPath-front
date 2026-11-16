import { mockOverview, mockServer, passMockLevels } from "@shared/test-utils/api-mock";

import { arenaUnlockOf } from "./arena-unlock";

const unlockAfter = (count: number) => {
  passMockLevels(count);
  return arenaUnlockOf(mockOverview("ru"));
};

describe("arenaUnlockOf", () => {
  afterEach(() => mockServer.reset());

  test("counts the passed levels up to the server's unlock level (ARN-01)", () => {
    expect(unlockAfter(9)).toMatchObject({ passed: 9, unlockLevel: 12 });
    expect(unlockAfter(20).passed).toBe(12);
  });

  test("keeps the arena locked until the server opens it", () => {
    expect(unlockAfter(11).isUnlocked).toBe(false);
  });

  test("opens the arena once the server says so", () => {
    expect(unlockAfter(12).isUnlocked).toBe(true);
  });

  test("stays locked before the campaign is known", () => {
    expect(arenaUnlockOf(undefined)).toEqual({ isUnlocked: false, unlockLevel: 12, passed: 0 });
  });
});
