import { paintCell, toggleCell } from "@entities/arena-map";
import type { EditRefusal } from "@entities/arena-map";
import { editFormatOf, eraseFeatures, toggleFeature } from "@entities/custom-level";
import type { Cell, CustomMap } from "@entities/custom-level";

import { isFeatureTool } from "./editor-tool";
import type { LevelEditorTool } from "./editor-tool";

export type LevelRefusal = EditRefusal | { kind: "onRock" } | { kind: "onHidden" };

export type LevelEditResult = { map: CustomMap } | { refusal: LevelRefusal };

// The arena edits keep the map's other fields, so beacons and buoys survive them (правки арены сохраняют остальные поля карты, поэтому маяки и буи не теряются).
export const applyCellEdit = (
  map: CustomMap,
  tool: Exclude<LevelEditorTool, "fence">,
  cell: Cell,
  isFirst: boolean,
): LevelEditResult => {
  if (isFeatureTool(tool)) return isFirst ? toggleFeature(map, tool, cell) : { map };
  const format = editFormatOf(map.rows, map.cols);
  const edit = isFirst ? toggleCell : paintCell;
  const result = edit(map, format, tool, cell);
  if ("refusal" in result) return result;
  const edited: CustomMap = { ...map, ...result.map };
  return { map: tool === "erase" ? eraseFeatures(edited, cell) : edited };
};
