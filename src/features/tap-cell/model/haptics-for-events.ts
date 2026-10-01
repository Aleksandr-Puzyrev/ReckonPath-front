import type { GameEvent } from "@reckon-path/engine";

import type { HapticKind } from "@shared/haptics";

// Several events can come from one tap; only the strongest one is felt (из одного тапа может прийти несколько событий; ощущается только самое сильное).
export const hapticsForEvents = (events: readonly GameEvent[]): HapticKind[] => {
  const types = new Set(events.map(({ type }) => type));
  if (types.has("win")) return ["success"];
  if (types.has("bomb")) return ["heavy", "error"];
  if (types.has("lose")) return ["warning"];
  if (types.has("targetFound")) return ["success"];
  if (types.has("blocked") || types.has("alreadyRevealed")) return ["warning"];

  const reveal = events.find((event) => event.type === "reveal");
  if (
    reveal?.type === "reveal" &&
    reveal.reveal.kind === "distance" &&
    reveal.reveal.heat === "hot"
  ) {
    return ["medium"];
  }
  return types.size > 0 ? ["light"] : [];
};
