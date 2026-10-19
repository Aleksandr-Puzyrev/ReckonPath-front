import type { PvpFormat } from "@reckon-path/engine";

import type { components } from "@shared/api";

type ArenaFormat = components["schemas"]["ArenaFormat"];

export const pvpFormatOf = ({ size, targets, limits }: ArenaFormat): PvpFormat => ({
  size,
  targets,
  limits: {
    fences: limits.fence,
    streams: limits.stream,
    heavy: limits.heavy,
    rocks: limits.rock,
    bridges: limits.bridge,
    bombs: limits.bomb,
  },
});
