export type ArenaLink =
  { isUnlocked: false; unlockLevel: number } | { isUnlocked: true; status: string };

export interface TodayStat {
  key: string;
  label: string;
  value: string;
}
