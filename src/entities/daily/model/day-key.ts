const DAY_MS = 86_400_000;
const DAY_KEY_LENGTH = 10;
const DAILY_ID_PREFIX = "d-";
const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const dayKeyOf = (time: number) => new Date(time).toISOString().slice(0, DAY_KEY_LENGTH);

export const nextDayStartOf = (time: number) => (Math.floor(time / DAY_MS) + 1) * DAY_MS;

export const dayKeyAfter = (dayKey: string, days: number) =>
  dayKeyOf(Date.parse(dayKey) + days * DAY_MS);

export const dailyLevelId = (dayKey: string) => `${DAILY_ID_PREFIX}${dayKey}`;

export const dayKeyOfLevelId = (levelId: string) => {
  if (!levelId.startsWith(DAILY_ID_PREFIX)) return null;
  const dayKey = levelId.slice(DAILY_ID_PREFIX.length);
  const time = Date.parse(dayKey);
  if (!DAY_KEY_PATTERN.test(dayKey) || Number.isNaN(time)) return null;
  return dayKeyOf(time) === dayKey ? dayKey : null;
};
