import type { LeagueTone } from "@shared/ui/league-emblem";

const TONES: Record<string, LeagueTone> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  MASTER: "master",
};

export const leagueToneOf = (league: string): LeagueTone => TONES[league] ?? "bronze";
