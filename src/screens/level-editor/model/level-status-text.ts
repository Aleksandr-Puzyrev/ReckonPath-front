import type { TFunction } from "i18next";

import type { CustomStatus } from "@entities/custom-level";
import { cellsRange } from "@shared/lib";

export const levelStatusTextOf = (status: CustomStatus, t: TFunction) => {
  if (status.kind === "valid") return t("map.validBot", { count: status.norm });
  if (status.kind === "isolated") return t("map.err.isolated", { cells: cellsRange(status.cells) });
  if (status.kind === "targets") return t("map.err.targets", { count: status.count });
  if (status.kind === "limit") return t("map.err.limit", { max: status.max });
  if (status.kind === "bridge") return t("map.err.bridge");
  return t("editor.invalid");
};
