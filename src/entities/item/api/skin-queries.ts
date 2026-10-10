import { queryOptions } from "@tanstack/react-query";

import { fetchAssetJson } from "@shared/api";

import { skinDataSchema } from "../model/skin-data";

import { itemKeys } from "./item-queries";

export const skinQueryOptions = (url: string) =>
  queryOptions({
    queryKey: itemKeys.skin(url),
    queryFn: async () => skinDataSchema.parse(await fetchAssetJson(url)),
    // A package URL names one version, so its skin never changes (адрес пакета называет одну версию, поэтому скин по нему не меняется).
    staleTime: Infinity,
  });
