const LEAGUE_ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER"] as const;
const NUMERALS: Record<number, string> = { 1: "I", 2: "II", 3: "III" };
const LOWEST_DIVISION = 3;
const MASTER = "MASTER";
const DAY_MS = 86_400_000;

export const divisionNumeral = (division: number) => NUMERALS[division] ?? "";

export const leagueLabelOf = (league: string, division: number) =>
  league === MASTER ? league : `${league} ${divisionNumeral(division)}`;

export const nextDivisionOf = (league: string, division: number) => {
  if (league === MASTER) return null;
  if (division > 1) return leagueLabelOf(league, division - 1);
  const next = LEAGUE_ORDER[LEAGUE_ORDER.findIndex((name) => name === league) + 1];
  return next === undefined ? null : leagueLabelOf(next, LOWEST_DIVISION);
};

export const divisionShare = (trophies: number, min: number, max: number) =>
  max > min ? Math.min(1, Math.max(0, (trophies - min) / (max - min))) : 1;

export const seasonDaysLeft = (endsAt: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(endsAt) - now) / DAY_MS));
