import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { meQueryOptions, updateLocaleMutationOptions, useMeQuery } from "@entities/wallet";
import { resolveLanguage } from "@shared/i18n";

// The server writes pushes in the account's language, so it follows the interface after sign-in and on every switch (сервер пишет пуши на языке аккаунта, поэтому он следует за интерфейсом после входа и при каждой смене).
export const useLocaleSync = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const { data: me } = useMeQuery();
  const { mutate, isPending, isError, variables } = useMutation({
    ...updateLocaleMutationOptions(),
    onSuccess: (updated) => queryClient.setQueryData(meQueryOptions().queryKey, updated),
  });
  const language = resolveLanguage(i18n.language);
  const savedLocale = me?.locale;

  // A failed language is not sent again until the next launch or switch, so an error does not loop (неудачный язык не отправляется снова до следующего запуска или смены, чтобы ошибка не зациклилась).
  const hasFailed = isError && variables === language;

  useEffect(() => {
    if (savedLocale === undefined || savedLocale === language || isPending || hasFailed) return;
    mutate(language);
  }, [savedLocale, language, isPending, hasFailed, mutate]);
};
