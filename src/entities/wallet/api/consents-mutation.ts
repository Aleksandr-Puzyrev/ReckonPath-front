import { mutationOptions } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

import { meQueryOptions } from "./wallet-queries";

type UpdateConsentsBody = components["schemas"]["UpdateConsentsRequest"];
type ConsentsState = components["schemas"]["ConsentsState"];

export type ConsentType = components["schemas"]["ConsentType"];

export const updateConsentsMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "consents"],
    mutationFn: async (body: UpdateConsentsBody) =>
      readData(await apiClient.PUT("/me/consents", { body })),
  });

// Only the consent fields are taken: the backend answers with its whole profile, which is not the client's player (берутся только поля согласий: бэкенд отвечает всем своим профилем, а это не игрок клиента).
export const applyConsents = (
  queryClient: QueryClient,
  { consents, consentsRequired }: ConsentsState,
) =>
  queryClient.setQueryData(meQueryOptions().queryKey, (me) =>
    me === undefined ? me : { ...me, consents, consentsRequired },
  );
