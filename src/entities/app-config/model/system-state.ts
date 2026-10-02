import { z } from "zod";

import { isApiError } from "@shared/api";
import type { components } from "@shared/api";

import { compareVersions } from "./compare-versions";

type Bootstrap = components["schemas"]["Bootstrap"];

export type SystemState =
  | { kind: "ready" }
  | { kind: "forcedUpdate"; storeUrl: string | null; message: string | null }
  | { kind: "softUpdate"; version: string; storeUrl: string; message: string | null }
  | { kind: "maintenance"; until: string | null; message: string | null };

const maintenanceDetailsSchema = z.object({
  until: z.string().optional(),
  message: z.string().optional(),
});

const errorCodeOf = (error: unknown) => (isApiError(error) ? error.code : null);

const maintenanceOf = (bootstrap: Bootstrap | undefined, error: unknown) => {
  if (isApiError(error) && error.code === "MAINTENANCE") {
    return maintenanceDetailsSchema.catch({}).parse(error.details);
  }
  return bootstrap?.maintenance ?? null;
};

export const systemStateOf = (
  bootstrap: Bootstrap | undefined,
  error: unknown,
  appVersion: string,
): SystemState => {
  const version = bootstrap?.version;
  const isBelowMin = version !== undefined && compareVersions(appVersion, version.min) < 0;
  if (isBelowMin || errorCodeOf(error) === "UPGRADE_REQUIRED") {
    return {
      kind: "forcedUpdate",
      storeUrl: version?.storeUrl ?? null,
      message: version?.message ?? null,
    };
  }
  const maintenance = maintenanceOf(bootstrap, error);
  if (maintenance !== null) {
    return {
      kind: "maintenance",
      until: maintenance.until ?? null,
      message: maintenance.message ?? null,
    };
  }
  if (version !== undefined && compareVersions(appVersion, version.recommended) < 0) {
    return {
      kind: "softUpdate",
      version: version.recommended,
      storeUrl: version.storeUrl,
      message: version.message ?? null,
    };
  }
  return { kind: "ready" };
};
