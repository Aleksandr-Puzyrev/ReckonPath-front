import type { components } from "../generated/schema";

export const ARENA_FORMAT: components["schemas"]["ArenaFormat"] = {
  size: 5,
  targets: 1,
  turnSec: 5,
  bombHint: true,
  limits: { fence: 3, stream: 3, heavy: 1, rock: 2, bridge: 1, bomb: 2 },
};
