import { generateDaily, levelSchema } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { dailyLevelId } from "./day-key";

// TODO: read the daily epoch from remote config once it is delivered per environment
export const dailyLevelOf = (dayKey: string, override: unknown): LevelInput => {
  const id = dailyLevelId(dayKey);
  // The day decides the id, so an override is checked under it (id задаёт день, поэтому подмена проверяется под ним).
  const parsed =
    typeof override === "object" && override !== null
      ? levelSchema.safeParse({ ...override, id })
      : null;
  if (parsed?.success === true) return parsed.data;
  return generateDaily(dayKey).level;
};
