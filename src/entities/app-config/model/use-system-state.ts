import { APP_VERSION } from "@shared/config";

import { useBootstrapQuery } from "../api/bootstrap-queries";

import { systemStateOf } from "./system-state";

export const useSystemState = () => {
  const { data, error, isFetching, refetch } = useBootstrapQuery();

  const check = async () => {
    const result = await refetch();
    return { state: systemStateOf(result.data, result.error, APP_VERSION), error: result.error };
  };

  return { state: systemStateOf(data, error, APP_VERSION), isChecking: isFetching, check };
};
