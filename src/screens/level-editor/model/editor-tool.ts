import type { CellTool } from "@entities/arena-map";
import type { FeatureTool } from "@entities/custom-level";

export type LevelEditorTool = CellTool | FeatureTool | "fence";

export const LEVEL_TOOLS: readonly LevelEditorTool[] = [
  "target",
  "fence",
  "stream",
  "heavy",
  "rock",
  "bridge",
  "bomb",
  "beacon",
  "buoy",
  "erase",
];

export const isFeatureTool = (tool: LevelEditorTool): tool is FeatureTool =>
  tool === "beacon" || tool === "buoy";
