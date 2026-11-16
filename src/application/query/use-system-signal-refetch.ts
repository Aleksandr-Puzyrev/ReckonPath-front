import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { appConfigKeys, banOfDetails, useBanStore } from "@entities/app-config";
import { walletKeys } from "@entities/wallet";
import { onSystemSignal } from "@shared/api";

export const useSystemSignalRefetch = () => {
  const queryClient = useQueryClient();

  // A ban for the whole app opens the ban screen; a 426 or 503 from any request re-reads the start-up data, which decides the screen; a signal while it is being read is skipped, or it would loop (бан на всё приложение открывает экран бана; 426 или 503 перечитывает стартовые данные, которые решают, какой экран показать; сигнал во время их чтения пропускается, иначе зациклится).
  useEffect(
    () =>
      onSystemSignal((signal, details) => {
        if (signal === "banned") {
          const ban = banOfDetails(details);
          if (ban.scope === "all") {
            useBanStore.getState().setBan(ban);
            return;
          }
          // An arena ban lives in the player's flags, which the arena reads; a ban while they are read is skipped, or it would loop (бан арены живёт во флагах игрока, которые читает арена; бан во время их чтения пропускается, иначе зациклится).
          const meKey = { queryKey: walletKeys.all, exact: true };
          if (queryClient.isFetching(meKey) === 0) void queryClient.invalidateQueries(meKey);
          return;
        }
        const queryKey = appConfigKeys.all;
        if (queryClient.isFetching({ queryKey }) > 0) return;
        queryClient.invalidateQueries({ queryKey });
      }),
    [queryClient],
  );
};
