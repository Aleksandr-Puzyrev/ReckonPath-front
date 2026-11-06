import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyConsents, updateConsentsMutationOptions, useMeQuery } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useAcceptConsents = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { data: me } = useMeQuery();
  const { mutate, isPending } = useMutation({
    ...updateConsentsMutationOptions(),
    onSuccess: (state) => applyConsents(queryClient, state),
    onError: (error) => onError(errorMessageKey(error)),
  });

  const required = me?.consentsRequired ?? [];

  return {
    accept: () => mutate({ consents: required.map((type) => ({ type, accepted: true })) }),
    canAccept: required.length > 0,
    isPending,
  };
};
