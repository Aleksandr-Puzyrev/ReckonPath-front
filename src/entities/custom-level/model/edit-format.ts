import { MAX_ROCK_SHARE, MAX_TARGETS } from "@reckon-path/engine";

import type { components } from "@shared/api";

type ArenaFormat = components["schemas"]["ArenaFormat"];

// Part 1 §7.4: user levels have no format limits, only the bomb (§2.5), target and rock (§2.7) rules; other elements are bounded by the board (Часть 1 §7.4: у пользовательских уровней нет лимитов формата, только правила бомб (§2.5), целей и скал (§2.7); остальное ограничено полем).
export const editFormatOf = (rows: number, cols: number): ArenaFormat => {
  const cells = rows * cols;
  return {
    size: Math.max(rows, cols),
    targets: MAX_TARGETS,
    turnSec: 0,
    bombHint: true,
    limits: {
      fence: cells * 2,
      stream: cells,
      heavy: cells,
      rock: Math.floor(cells * MAX_ROCK_SHARE),
      bridge: cells,
      bomb: cells,
    },
  };
};
