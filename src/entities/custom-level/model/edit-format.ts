import { MAX_ROCK_SHARE, MAX_TARGETS } from "@reckon-path/engine";

import type { components } from "@shared/api";

type EditFormat = Pick<components["schemas"]["MatchFormat"], "targets" | "caps">;

// Part 1 §7.4: user levels have no format limits, only the bomb (§2.5), target and rock (§2.7) rules; other elements are bounded by the board (Часть 1 §7.4: у пользовательских уровней нет лимитов формата, только правила бомб (§2.5), целей и скал (§2.7); остальное ограничено полем).
export const editFormatOf = (rows: number, cols: number): EditFormat => {
  const cells = rows * cols;
  return {
    targets: MAX_TARGETS,
    caps: {
      fences: cells * 2,
      stream: cells,
      heavy: cells,
      rock: Math.floor(cells * MAX_ROCK_SHARE),
      bridge: cells,
      bombs: cells,
    },
  };
};
