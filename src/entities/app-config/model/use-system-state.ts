import type { components } from "@shared/api";
import { INSTALL_STORE } from "@shared/config";

import { useMaintenanceQuery, useVersionQuery } from "../api/system-queries";

import { systemStateOf } from "./system-state";

type VersionInfo = components["schemas"]["VersionInfo"];
type MaintenanceStatus = components["schemas"]["MaintenanceStatus"];

const stateOf = (
  version: VersionInfo | undefined,
  maintenance: MaintenanceStatus | undefined,
  error: unknown,
) => systemStateOf({ version, maintenance, error, store: INSTALL_STORE });

export const useSystemState = () => {
  const version = useVersionQuery();
  const maintenance = useMaintenanceQuery();

  const check = async () => {
    const [nextVersion, nextMaintenance] = await Promise.all([
      version.refetch(),
      maintenance.refetch(),
    ]);
    const error = nextVersion.error ?? nextMaintenance.error;
    return { state: stateOf(nextVersion.data, nextMaintenance.data, error), error };
  };

  return {
    state: stateOf(version.data, maintenance.data, version.error ?? maintenance.error),
    isChecking: version.isFetching || maintenance.isFetching,
    check,
  };
};
