import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import type { AdPlacement } from "../model/ad-type";

import { adLimitsQueryOptions, fetchAdIntentStatus, requestAdIntent } from "./ad-queries";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});

const requestIntent = (placement: AdPlacement) => requestAdIntent(placement);

const limits = () => queryClient.fetchQuery({ ...adLimitsQueryOptions(), staleTime: 0 });

const watchAd = async (placement: AdPlacement) => {
  const { adIntentId } = await requestIntent(placement);
  return fetchAdIntentStatus(adIntentId);
};

describe("ad queries", () => {
  afterEach(() => mockServer.reset());

  test("start the day with no ads watched", async () => {
    expect((await limits()).gems).toMatchObject({ used: 0, max: 5 });
  });

  test("give an intent with the ads left today", async () => {
    expect(await requestIntent("gems")).toMatchObject({
      leftToday: 5,
      customData: expect.any(String),
    });
  });

  test("credit ◆ 5 after the SSV and count the ad (ADS-01)", async () => {
    const status = await watchAd("gems");

    expect(status).toMatchObject({
      status: "rewarded",
      reward: { currency: "emerald", amount: 5 },
    });
    expect(status.wallet?.emeralds).toBe(2645);
    expect((await limits()).gems.used).toBe(1);
  });

  test("credit once for a repeated status (ADS-03)", async () => {
    const { adIntentId } = await requestIntent("gems");

    await fetchAdIntentStatus(adIntentId);
    const repeat = await fetchAdIntentStatus(adIntentId);

    expect(repeat.wallet?.emeralds).toBe(2645);
    expect((await limits()).gems.used).toBe(1);
  });

  test("refuse an ad over the daily limit (ADS-04)", async () => {
    for (let ad = 0; ad < 5; ad += 1) await watchAd("gems");

    const error: unknown = await requestIntent("gems").catch((rejection: unknown) => rejection);

    expect(error).toMatchObject({ code: "LIMIT_REACHED", details: { kind: "gems" } });
  });

  test("grant a continue as a right, not currency", async () => {
    const status = await watchAd("continue");

    expect(status.status).toBe("rewarded");
    expect(status.reward).toBeUndefined();
    expect((await apiClient.GET("/me")).data?.wallet.emeralds).toBe(2640);
  });
});
