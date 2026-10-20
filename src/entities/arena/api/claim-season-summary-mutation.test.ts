import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { claimSeasonSummaryMutationOptions } from "./claim-season-summary-mutation";

const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });

const claim = () => new MutationObserver(queryClient, claimSeasonSummaryMutationOptions()).mutate();

describe("claimSeasonSummaryMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("shows the last season summary until it is claimed (decision 0038 #1)", async () => {
    const before = (await apiClient.GET("/arena")).data;
    expect(before?.lastSeason).toEqual(
      expect.objectContaining({ seasonId: 1, peakLeague: "GOLD", claimed: false }),
    );
    expect(before?.season.id).toBe(2);

    await claim();

    expect((await apiClient.GET("/arena")).data?.lastSeason).toBeNull();
  });

  test("credits the rewards once and answers a repeat as a duplicate (ARN-21)", async () => {
    const first = await claim();
    const second = await claim();

    expect(first.duplicate).toBe(false);
    expect(first.wallet.coins - second.wallet.coins).toBe(0);
    expect(second.duplicate).toBe(true);
  });
});
