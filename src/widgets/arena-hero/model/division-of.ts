import { divisionOf, LEAGUES, leagueOf } from "@reckon-path/engine";

const DIVISIONS = 3;
const DIVISION_NUMBERS = { III: 3, II: 2, I: 1 } as const;

export const divisionStateOf = (trophies: number) => {
  const league = leagueOf(trophies);
  const range = LEAGUES.find((item) => item.league === league) ?? { min: 0, max: 0 };
  const division = DIVISION_NUMBERS[divisionOf(trophies) ?? "I"];
  if (!Number.isFinite(range.max)) {
    return { league: league.toUpperCase(), division, min: range.min, max: trophies };
  }
  const width = (range.max - range.min) / DIVISIONS;
  const index = DIVISIONS - division;
  return {
    league: league.toUpperCase(),
    division,
    min: Math.round(range.min + index * width),
    max: Math.round(range.min + (index + 1) * width),
  };
};
