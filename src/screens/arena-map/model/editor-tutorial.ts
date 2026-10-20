import type { EditRefusal, PvpMap } from "@entities/arena-map";

import type { EditorTool } from "./use-map-editor";

export const TUTORIAL_MAP: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [],
  bombs: [],
  streams: [
    [0, 2],
    [1, 2],
    [2, 2],
  ],
  bridges: [[1, 2]],
  rocks: [
    [4, 0],
    [3, 4],
  ],
  fences: [
    [
      [3, 1],
      [3, 2],
    ],
  ],
};

export const TUTORIAL_TOOLS = ["target", "bomb"] as const satisfies readonly EditorTool[];

export const TUTORIAL_BOMBS = 1;

type TutorialRefusalKey =
  | "map.tutorial.rock"
  | "map.tutorial.shared"
  | "map.tutorial.targetLimit"
  | "map.tutorial.bombLimit";

export const tutorialRefusalKey = (
  refusal: EditRefusal,
  tool: EditorTool,
): TutorialRefusalKey | null => {
  if (refusal.kind === "targetOnRock" || refusal.kind === "bombOnRock") return "map.tutorial.rock";
  if (refusal.kind === "bombAndTarget") return "map.tutorial.shared";
  if (refusal.kind !== "limit") return null;
  return tool === "bomb" ? "map.tutorial.bombLimit" : "map.tutorial.targetLimit";
};

export const tutorialHintKey = (
  { targets, bombs }: { targets: number; bombs: number },
  maxTargets: number,
): "map.tutorial.target" | "map.tutorial.bomb" | null => {
  if (targets < maxTargets) return "map.tutorial.target";
  return bombs < TUTORIAL_BOMBS ? "map.tutorial.bomb" : null;
};
