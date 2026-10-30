import { z } from "zod";

import { isApiError } from "@shared/api";
import type { components } from "@shared/api";
import type { InstallStore } from "@shared/config";

type VersionInfo = components["schemas"]["VersionInfo"];
type MaintenanceStatus = components["schemas"]["MaintenanceStatus"];

export type SystemState =
  | { kind: "ready" }
  | { kind: "forcedUpdate"; storeUrl: string | null }
  | { kind: "softUpdate"; version: string; storeUrl: string | null }
  | { kind: "maintenance"; until: string | null; message: string | null };

interface SystemInput {
  version: VersionInfo | undefined;
  maintenance: MaintenanceStatus | undefined;
  error: unknown;
  store: InstallStore;
}

const storeLinksSchema = z.object({
  ruStore: z.string().optional(),
  playMarket: z.string().optional(),
  appStore: z.string().optional(),
});

const maintenanceDetailsSchema = z.object({
  until: z.string().optional(),
  message: z.string().optional(),
});

type StoreLinks = z.infer<typeof storeLinksSchema>;

const textOf = (value: string | undefined) => (value === undefined || value === "" ? null : value);

const linkOf = (links: StoreLinks, store: InstallStore) => textOf(links[store]);

export const systemStateOf = ({ version, maintenance, error, store }: SystemInput): SystemState => {
  const apiError = isApiError(error) ? error : null;
  if (apiError?.code === "app_update_required") {
    const links = storeLinksSchema.catch({}).parse(apiError.details);
    return { kind: "forcedUpdate", storeUrl: linkOf(links, store) };
  }
  if (version?.forceUpdate === true) {
    return { kind: "forcedUpdate", storeUrl: linkOf(version, store) };
  }
  if (apiError?.code === "maintenance") {
    const details = maintenanceDetailsSchema.catch({}).parse(apiError.details);
    return { kind: "maintenance", until: details.until ?? null, message: textOf(details.message) };
  }
  if (maintenance?.active === false) {
    return { kind: "maintenance", until: null, message: textOf(maintenance.message) };
  }
  if (version?.showModal === true) {
    return {
      kind: "softUpdate",
      version: version.currentVersion,
      storeUrl: linkOf(version, store),
    };
  }
  return { kind: "ready" };
};
