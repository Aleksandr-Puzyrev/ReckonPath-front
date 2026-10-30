import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSettingsStore } from "@entities/settings";
import { updateLocaleMutationOptions } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { applyLanguage } from "@shared/i18n";
import type { AppLanguage } from "@shared/i18n";

// The interface switches at once; server texts come in the new language after the refetch (интерфейс переключается сразу, серверные тексты приходят на новом языке после перезапроса).
export const useChangeLanguage = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    ...updateLocaleMutationOptions(),
    onError: (error) => onError(errorMessageKey(error)),
    onSettled: () => queryClient.invalidateQueries(),
  });

  return (language: AppLanguage) => {
    useSettingsStore.getState().setLanguage(language);
    applyLanguage(language);
    mutate(language);
  };
};
