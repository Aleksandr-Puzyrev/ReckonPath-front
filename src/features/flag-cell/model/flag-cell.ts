import type { Idx } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { haptic } from "@shared/haptics";

export const flagCell = (cell: Idx) => {
  const before = useGameSessionStore.getState().flags;
  useGameSessionStore.getState().toggleFlag(cell);
  if (useGameSessionStore.getState().flags !== before) haptic("selection");
};
