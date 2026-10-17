import { isInterstitialDue } from "./interstitial-rule";

const RULES = { everyN: 3, minIntervalSec: 180, minLevel: 10 };
const NOW = Date.UTC(2026, 9, 12, 12);
const MINUTE = 60_000;

const moment = (overrides: Partial<Parameters<typeof isInterstitialDue>[0]> = {}) => ({
  finishedLevels: 3,
  lastAdAt: NOW - 4 * MINUTE,
  firstLaunchAt: NOW - 60 * MINUTE,
  currentLevel: 12,
  now: NOW,
  ...overrides,
});

describe("isInterstitialDue", () => {
  test("shows after the 3rd finished level past the interval (ADS-06)", () => {
    expect(isInterstitialDue(moment(), RULES)).toBe(true);
  });

  test("waits for the 3rd level", () => {
    expect(isInterstitialDue(moment({ finishedLevels: 2 }), RULES)).toBe(false);
  });

  test("shows nothing before campaign level 10 (ADS-05)", () => {
    expect(isInterstitialDue(moment({ currentLevel: 9 }), RULES)).toBe(false);
  });

  test("shows nothing right after another ad (ADS-07)", () => {
    expect(isInterstitialDue(moment({ lastAdAt: NOW - MINUTE }), RULES)).toBe(false);
  });

  test("keeps the first 10 minutes of the first session quiet", () => {
    expect(isInterstitialDue(moment({ firstLaunchAt: NOW - 9 * MINUTE }), RULES)).toBe(false);
  });

  test("shows the first one when no ad was ever shown", () => {
    expect(isInterstitialDue(moment({ lastAdAt: null }), RULES)).toBe(true);
  });
});
