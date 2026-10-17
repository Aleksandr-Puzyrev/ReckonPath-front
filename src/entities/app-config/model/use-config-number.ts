import { useBootstrapQuery } from "../api/bootstrap-queries";

// Remote config may lack a key or send another type; the spec default stands in then (в remote config ключа может не быть или тип другой — тогда работает значение из ТЗ).
export const useConfigNumber = (key: string, fallback: number) => {
  const { data } = useBootstrapQuery();
  const value = data?.config[key];
  return typeof value === "number" ? value : fallback;
};
