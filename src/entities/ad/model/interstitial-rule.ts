export interface InterstitialRules {
  everyN: number;
  minIntervalSec: number;
  minLevel: number;
}

interface InterstitialMoment {
  finishedLevels: number;
  lastAdAt: number | null;
  firstLaunchAt: number | null;
  currentLevel: number;
  now: number;
}

const MS_PER_SECOND = 1000;
// Part 1 §6.5 sets the first 10 minutes of the first session without interstitials; remote config has no key for it (Часть 1 §6.5 задаёт первые 10 минут первой сессии без межстраничной рекламы; ключа в remote config для этого нет).
const FIRST_SESSION_QUIET_MS = 10 * 60_000;

export const isInterstitialDue = (
  { finishedLevels, lastAdAt, firstLaunchAt, currentLevel, now }: InterstitialMoment,
  { everyN, minIntervalSec, minLevel }: InterstitialRules,
) =>
  finishedLevels >= everyN &&
  currentLevel >= minLevel &&
  firstLaunchAt !== null &&
  now - firstLaunchAt >= FIRST_SESSION_QUIET_MS &&
  (lastAdAt === null || now - lastAdAt >= minIntervalSec * MS_PER_SECOND);
