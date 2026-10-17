import type { AdsProvider } from "./ads-provider";

const WATCH_MS = 1000;

// Dev builds and tests until the real SDKs come: the ad is watched after a second, the reward goes through the mock SSV (dev-сборки и тесты до настоящих SDK: реклама досмотрена через секунду, награда идёт через мок SSV).
export const mockAdsProvider: AdsProvider = {
  init: async () => undefined,
  loadRewarded: async () => undefined,
  loadInterstitial: async () => undefined,
  showInterstitial: async () => undefined,
  showRewarded: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ rewarded: true }), WATCH_MS);
    }),
};
