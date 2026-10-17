import { http, HttpResponse } from "msw/http";

import { AdUnavailableError, adsProvider } from "@shared/ads";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useInterstitialStore } from "./interstitial-store";
import { watchRewardedAd } from "./watch-rewarded-ad";

const watch = async (placement: Parameters<typeof watchRewardedAd>[0] = "gems") => {
  const outcome = watchRewardedAd(placement);
  await jest.advanceTimersByTimeAsync(11_000);
  return outcome;
};

describe("watchRewardedAd", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useInterstitialStore.getState().reset();
  });

  afterEach(() => {
    mockServer.reset();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("returns the reward after the SSV (ADS-01)", async () => {
    const outcome = await watch();

    expect(outcome).toMatchObject({ kind: "rewarded", status: { reward: { amount: 5 } } });
    expect(useInterstitialStore.getState().lastAdAt).not.toBeNull();
  });

  test("grants nothing for an ad closed early (LVL-14)", async () => {
    jest.spyOn(adsProvider, "showRewarded").mockResolvedValue({ rewarded: false });

    expect(await watch()).toEqual({ kind: "unavailable" });
  });

  test("grants nothing without a fill (ADS-10)", async () => {
    jest.spyOn(adsProvider, "loadRewarded").mockRejectedValue(new AdUnavailableError());

    expect(await watch()).toEqual({ kind: "unavailable" });
  });

  test("reports a reward still on its way after 10 s (ADS-02)", async () => {
    mockServer.use(
      http.get(mockUrl("/ads/intent/:id"), () => HttpResponse.json({ status: "pending" })),
    );

    expect(await watch()).toMatchObject({ kind: "late" });
  });

  test("keeps waiting through a failed status request, then reports a late reward", async () => {
    mockServer.use(http.get(mockUrl("/ads/intent/:id"), () => HttpResponse.error()));

    expect(await watch()).toMatchObject({ kind: "late" });
  });

  test("grants nothing for an expired intent", async () => {
    mockServer.use(
      http.get(mockUrl("/ads/intent/:id"), () => HttpResponse.json({ status: "expired" })),
    );

    expect(await watch()).toEqual({ kind: "unavailable" });
  });

  test("fails over the daily limit (ADS-04)", async () => {
    mockServer.use(
      http.post(mockUrl("/ads/intent"), () =>
        HttpResponse.json({ error: { code: "LIMIT_REACHED" } }, { status: 422 }),
      ),
    );

    const outcome = expect(watchRewardedAd("gems")).rejects.toMatchObject({
      code: "LIMIT_REACHED",
    });
    await jest.advanceTimersByTimeAsync(0);

    await outcome;
  });
});
