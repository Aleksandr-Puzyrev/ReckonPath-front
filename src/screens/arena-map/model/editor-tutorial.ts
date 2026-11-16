import type { EditRefusal, MatchFormat, PvpMap } from "@entities/arena-map";

import type { EditorTool } from "./use-map-editor";

type Cell = [number, number];

const TUTORIAL_STREAM: Cell[] = [
  [0, 2],
  [1, 2],
  [2, 2],
];
const TUTORIAL_BRIDGE: Cell = [1, 2];
const TUTORIAL_FENCE: [Cell, Cell] = [
  [3, 1],
  [3, 2],
];
const WATER_UNDER_BRIDGE = TUTORIAL_STREAM.length - 1;

// The template follows the league format: its size and only the elements its caps allow (шаблон следует формату лиги: его размер и только те элементы, что позволяют лимиты).
export const tutorialMapOf = ({ rows, cols, caps }: MatchFormat): PvpMap => {
  const hasStream = caps.stream >= WATER_UNDER_BRIDGE;
  const rocks: Cell[] = [
    [rows - 1, 0],
    [rows - 2, cols - 1],
  ];
  return {
    rows,
    cols,
    targets: [],
    bombs: [],
    streams: hasStream ? TUTORIAL_STREAM : [],
    bridges: hasStream && caps.bridge > 0 ? [TUTORIAL_BRIDGE] : [],
    rocks: rocks.slice(0, caps.rock),
    fences: caps.fences > 0 ? [TUTORIAL_FENCE] : [],
  };
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
