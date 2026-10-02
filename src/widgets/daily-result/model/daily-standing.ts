import type { DailyRecord } from "@entities/daily";

export type DailyPlace =
  { kind: "rank"; rank: number } | { kind: "counting" } | { kind: "none" } | { kind: "unknown" };

export type DailyNote = "offline" | "replay" | "notRanked" | null;

interface StandingInput {
  record: DailyRecord | undefined;
  isCounted: boolean;
  isPending: boolean;
  isOnline: boolean;
}

export interface DailyStanding {
  place: DailyPlace;
  note: DailyNote;
  topPercent: number | null;
}

const PERCENT = 100;
const MIN_TOP_PERCENT = 1;

// A replay never ranks; the counted attempt waits for the server, then shows its place or why it has none (переигровка не ранжируется; зачётная попытка ждёт сервер, затем показывает место или причину его отсутствия).
export const dailyStandingOf = ({
  record,
  isCounted,
  isPending,
  isOnline,
}: StandingInput): DailyStanding => {
  if (!isCounted || record === undefined) {
    return { place: { kind: "none" }, note: "replay", topPercent: null };
  }
  if (record.rank !== null) {
    return {
      place: { kind: "rank", rank: record.rank },
      note: null,
      topPercent:
        record.percentile === null ? null : Math.max(MIN_TOP_PERCENT, PERCENT - record.percentile),
    };
  }
  if (isPending) {
    return isOnline
      ? { place: { kind: "counting" }, note: null, topPercent: null }
      : { place: { kind: "unknown" }, note: "offline", topPercent: null };
  }
  return {
    place: { kind: "none" },
    note: record.ranked === false ? "notRanked" : null,
    topPercent: null,
  };
};
