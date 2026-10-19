import type { TFunction } from "i18next";

import type { MapStatus } from "@entities/arena-map";

import { cellsRange } from "./cells-range";

export const statusTextOf = (status: MapStatus, t: TFunction) => {
  if (status.kind === "valid") return t("map.validBot", { count: status.norm });
  if (status.kind === "isolated") return t("map.err.isolated", { cells: cellsRange(status.cells) });
  if (status.kind === "targets") return t("map.err.targets", { count: status.count });
  if (status.kind === "limit") return t("map.err.limit", { max: status.max });
  if (status.kind === "bridge") return t("map.err.bridge");
  if (status.kind === "trivial") return t("map.err.trivial", { count: status.norm });
  return t("errors.MAP_INVALID");
};
