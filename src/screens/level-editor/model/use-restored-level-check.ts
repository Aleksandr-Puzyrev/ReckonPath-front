import { useEffect, useEffectEvent } from "react";

import { useCustomLevelQuery } from "@entities/custom-level";
import { isApiError } from "@shared/api";

// Only a draft restored after a restart can miss from the list: the server tells whether its level was deleted elsewhere (только черновик, восстановленный после перезапуска, может отсутствовать в списке: сервер говорит, удалён ли его уровень в другом месте).
export const useRestoredLevelCheck = (id: string, isUnlisted: boolean, onGone: () => void) => {
  const { error } = useCustomLevelQuery(id, isUnlisted);
  const isGone = isUnlisted && isApiError(error) && error.code === "level_not_found";
  const handleGone = useEffectEvent(onGone);

  useEffect(() => {
    if (isGone) handleGone();
  }, [isGone]);
};
