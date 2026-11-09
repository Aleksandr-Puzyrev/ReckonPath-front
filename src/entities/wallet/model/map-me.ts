import type { components } from "@shared/api";

type BackendMe = components["schemas"]["Me"];
type BackendArena = NonNullable<BackendMe["arena"]>;

export interface MeArena {
  trophies: number;
  league: string;
  division: number;
}

export type Me = Omit<BackendMe, "arena"> & { arena?: MeArena };

const DIVISIONS: Record<BackendArena["division"], number> = { III: 3, II: 2, I: 1 };

// The arena screens name leagues in upper case, the backend in lower case (экраны арены пишут лиги заглавными, бэкенд — строчными).
const mapArena = ({ trophies, league, division }: BackendArena): MeArena => ({
  trophies,
  league: league.toUpperCase(),
  division: DIVISIONS[division],
});

export const mapMe = ({ arena, ...me }: BackendMe): Me =>
  arena === undefined ? me : { ...me, arena: mapArena(arena) };
