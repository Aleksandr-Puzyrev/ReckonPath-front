import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { appConfigKeys } from "@entities/app-config";
import { onSystemSignal } from "@shared/api";

export const useSystemSignalRefetch = () => {
  const queryClient = useQueryClient();

  // A 426 or 503 from any request re-reads the bootstrap, which decides the screen; a signal from the bootstrap itself is skipped, or it would loop (426 или 503 перечитывает bootstrap, который решает, какой экран показать; сигнал от самого bootstrap пропускается, иначе зациклится).
  useEffect(
    () =>
      onSystemSignal(() => {
        const queryKey = appConfigKeys.bootstrap();
        if (queryClient.isFetching({ queryKey }) > 0) return;
        queryClient.invalidateQueries({ queryKey });
      }),
    [queryClient],
  );
};
