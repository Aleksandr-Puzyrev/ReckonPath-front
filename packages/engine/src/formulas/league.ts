export type League = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master";
export type Division = "III" | "II" | "I";

interface LeagueRange {
  league: League;
  min: number;
  max: number;
}

const BRONZE: LeagueRange = { league: "bronze", min: 0, max: 800 };

export const LEAGUES: readonly LeagueRange[] = [
  BRONZE,
  { league: "silver", min: 800, max: 2000 },
  { league: "gold", min: 2000, max: 3200 },
  { league: "platinum", min: 3200, max: 4400 },
  { league: "diamond", min: 4400, max: 5600 },
  { league: "master", min: 5600, max: Number.POSITIVE_INFINITY },
];

const DIVISIONS: readonly Division[] = ["III", "II", "I"];

const leagueRange = (trophies: number) =>
  LEAGUES.find(({ min, max }) => trophies >= min && trophies < max) ?? BRONZE;

export const leagueOf = (trophies: number): League => leagueRange(trophies).league;

export const divisionOf = (trophies: number): Division | null => {
  const range = leagueRange(trophies);
  if (range.league === "master") return null;

  const index = Math.floor((trophies - range.min) / ((range.max - range.min) / DIVISIONS.length));
  return DIVISIONS[index] ?? null;
};
