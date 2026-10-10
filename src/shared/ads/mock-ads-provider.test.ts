import { mockAdsProvider } from "./mock-ads-provider";

describe("mockAdsProvider", () => {
  test("counts the ad as watched after a second", async () => {
    jest.useFakeTimers();
    const result = mockAdsProvider.showRewarded({
      unitId: "mock-gems",
      customData: "intent_1",
      isPersonalized: true,
    });

    jest.advanceTimersByTime(1000);

    await expect(result).resolves.toEqual({ rewarded: true });
    jest.useRealTimers();
  });
});
