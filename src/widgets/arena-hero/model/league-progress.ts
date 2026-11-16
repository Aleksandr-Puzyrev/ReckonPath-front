import type { LeagueStep } from "@entities/arena";

const NUMERALS: Record<number, string> = { 1: "I", 2: "II", 3: "III" };
const MASTER = "MASTER";
const DAY_MS = 86_400_000;

export const divisionNumeral = (division: number) => NUMERALS[division] ?? "";

export const leagueLabelOf = (league: string, division: number) =>
  league === MASTER ? league : `${league} ${divisionNumeral(division)}`;

// An empty division means the league has only one (пустой дивизион — у лиги он один).
export const stepLabelOf = ({ title, division }: Pick<LeagueStep, "title" | "division">) =>
  [title.toUpperCase(), division].filter((part) => part !== "").join(" ");

export const divisionShare = (trophies: number, min: number, max: number) =>
  max > min ? Math.min(1, Math.max(0, (trophies - min) / (max - min))) : 1;

export const seasonDaysLeft = (endsAt: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(endsAt) - now) / DAY_MS));
