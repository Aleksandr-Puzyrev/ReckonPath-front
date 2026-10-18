import type { LevelInput } from "@reckon-path/engine";

import type { PvpMap } from "./arena-map-type";

export const levelOfMap = (map: PvpMap): LevelInput => ({
  ...map,
  v: 2,
  id: "u-arena-map",
  probeMode: "distance",
});
