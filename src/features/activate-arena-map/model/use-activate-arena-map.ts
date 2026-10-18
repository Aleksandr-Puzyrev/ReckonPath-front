import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arenaKeys } from "@entities/arena";
import { activateArenaMapMutationOptions, arenaMapKeys } from "@entities/arena-map";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface ActivateCallbacks {
  onActivated: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useActivateArenaMap = ({ onActivated, onError }: ActivateCallbacks) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...activateArenaMapMutationOptions(),
    onSuccess: onActivated,
    onError: (error) => onError(errorMessageKey(error)),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: arenaKeys.all }),
        queryClient.invalidateQueries({ queryKey: arenaMapKeys.all }),
      ]),
  });

  return { activate: mutate, isPending };
};
