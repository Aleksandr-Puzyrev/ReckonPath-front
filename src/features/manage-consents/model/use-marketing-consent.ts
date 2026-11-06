import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyConsents, updateConsentsMutationOptions, useMeQuery } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useMarketingConsent = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { data: me } = useMeQuery();
  const { mutate, isPending, variables } = useMutation({
    ...updateConsentsMutationOptions(),
    onSuccess: (state) => applyConsents(queryClient, state),
    onError: (error) => onError(errorMessageKey(error)),
  });
  const isAccepted =
    me?.consents.some(({ type, accepted }) => type === "marketing" && accepted) ?? false;
  // While the request runs the switch shows the chosen state; a failure returns it (пока идёт запрос, переключатель показывает выбранное; ошибка возвращает его назад).
  const isOn = isPending ? (variables.consents[0]?.accepted ?? isAccepted) : isAccepted;

  return {
    isOn,
    toggle: () => {
      if (isPending) return;
      mutate({ consents: [{ type: "marketing", accepted: !isOn }] });
    },
  };
};
