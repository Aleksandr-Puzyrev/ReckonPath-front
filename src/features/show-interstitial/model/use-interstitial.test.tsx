import { act, cleanup, renderHook } from "@testing-library/react-native";

import { useInterstitialStore } from "@entities/ad";
import { CAMPAIGN_LEVELS } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { adsProvider } from "@shared/ads";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useInterstitial } from "./use-interstitial";

const HOUR = 3_600_000;

const reachLevel = (number: number) =>
  useProgressStore
    .getState()
    .replaceBest(
      Object.fromEntries(
        CAMPAIGN_LEVELS.slice(0, number - 1).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
      ),
    );

const renderInterstitial = () =>
  renderHook(() => useInterstitial(), { wrapper: createQueryWrapper() });

describe("useInterstitial", () => {
  beforeEach(() => {
    useInterstitialStore.getState().reset();
    useInterstitialStore.getState().markLaunched(Date.now() - HOUR);
    useProgressStore.getState().reset();
  });

  // Unmounted first, so the remote config still loading cannot update it after the test (сначала размонтируется, чтобы ещё идущий remote config не обновил хук после теста).
  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    jest.restoreAllMocks();
  });

  test("shows on the 3rd finished level and starts a new cycle (ADS-06)", async () => {
    reachLevel(12);
    const show = jest.spyOn(adsProvider, "showInterstitial");
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }
    await act(() => result.current.showIfDue());

    expect(show).toHaveBeenCalled();
    expect(useInterstitialStore.getState().finishedLevels).toBe(0);
  });

  test("preloads after the 2nd finished level", async () => {
    reachLevel(12);
    const load = jest.spyOn(adsProvider, "loadInterstitial");
    const { result } = await renderInterstitial();

    await act(async () => result.current.finishLevel());
    expect(load).not.toHaveBeenCalled();
    await act(async () => result.current.finishLevel());

    expect(load).toHaveBeenCalledTimes(1);
  });

  test("shows nothing before level 10 (ADS-05)", async () => {
    reachLevel(5);
    const show = jest.spyOn(adsProvider, "showInterstitial");
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }
    await act(() => result.current.showIfDue());

    expect(show).not.toHaveBeenCalled();
  });

  test("keeps the counter when no ad is shown", async () => {
    reachLevel(12);
    jest.spyOn(adsProvider, "showInterstitial").mockRejectedValue(new Error("no fill"));
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }
    await act(() => result.current.showIfDue());

    expect(useInterstitialStore.getState().finishedLevels).toBe(3);
  });

  test("shows nothing right after a rewarded ad (ADS-07)", async () => {
    reachLevel(12);
    useInterstitialStore.getState().noteAdShown(Date.now());
    const show = jest.spyOn(adsProvider, "showInterstitial");
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }
    await act(() => result.current.showIfDue());

    expect(show).not.toHaveBeenCalled();
  });

  test("keeps the first 10 minutes of the first session quiet", async () => {
    reachLevel(12);
    useInterstitialStore.getState().reset();
    useInterstitialStore.getState().markLaunched(Date.now());
    const show = jest.spyOn(adsProvider, "showInterstitial");
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }
    await act(() => result.current.showIfDue());

    expect(show).not.toHaveBeenCalled();
  });

  test("preloads once even when the counter grew past its turn", async () => {
    reachLevel(5);
    const load = jest.spyOn(adsProvider, "loadInterstitial");
    const { result } = await renderInterstitial();

    for (let level = 0; level < 6; level += 1) {
      await act(async () => result.current.finishLevel());
    }

    expect(load).toHaveBeenCalledTimes(1);
  });

  test("tries the preload again after a failed load", async () => {
    reachLevel(12);
    const load = jest
      .spyOn(adsProvider, "loadInterstitial")
      .mockRejectedValueOnce(new Error("no fill"));
    const { result } = await renderInterstitial();

    for (let level = 0; level < 3; level += 1) {
      await act(async () => result.current.finishLevel());
    }

    expect(load).toHaveBeenCalledTimes(2);
  });
});
