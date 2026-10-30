import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import { useEffect } from "react";

import { appConfigKeys } from "@entities/app-config";
import { useAccountStore } from "@entities/session";

const isAccountData = ({ queryKey }: Query) => queryKey[0] !== appConfigKeys.all[0];

// The persisted cache outlives the account: a guest must not see its wallet, streak or showroom (сохранённый кэш переживает аккаунт: гость не должен видеть его кошелёк, серию и витрину).
export const useGuestCacheCleanup = () => {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();

  // The saved cache comes back after the first render, so the start check waits for it (сохранённый кэш возвращается после первого рендера, поэтому проверка на старте его ждёт).
  useEffect(() => {
    if (isRestoring || useAccountStore.getState().hasLogin) return;
    queryClient.removeQueries({ predicate: isAccountData });
  }, [queryClient, isRestoring]);

  useEffect(
    () =>
      useAccountStore.subscribe((account, previous) => {
        if (previous.hasLogin && !account.hasLogin) {
          queryClient.removeQueries({ predicate: isAccountData });
        }
      }),
    [queryClient],
  );
};
