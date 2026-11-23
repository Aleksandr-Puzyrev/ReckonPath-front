import { defaultEditorCapsOf, editorLimitsOf } from "@reckon-path/engine";
import type { EditorCounts } from "@reckon-path/engine";

import type { components } from "@shared/api";

import type { CustomMap } from "./custom-level-type";

type EditFormat = Pick<components["schemas"]["MatchFormat"], "targets" | "caps">;

// The arena edits take the backend default caps in the arena format shape (правки арены получают лимиты бэкенда по умолчанию в форме формата арены).
export const editFormatOf = (rows: number, cols: number): EditFormat => {
  const caps = defaultEditorCapsOf(rows, cols);
  return {
    targets: caps.targets,
    caps: {
      fences: caps.fences,
      stream: caps.streams,
      heavy: caps.heavy,
      rock: caps.rocks,
      bridge: caps.bridges,
      bombs: caps.bombs,
    },
  };
};

export const customLimitsOf = (map: CustomMap): EditorCounts =>
  editorLimitsOf(map, defaultEditorCapsOf(map.rows, map.cols));
