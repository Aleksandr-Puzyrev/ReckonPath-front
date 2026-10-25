import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { LevelInput } from "@reckon-path/engine";

import { customLevelKeys, saveCustomLevelMutationOptions } from "@entities/custom-level";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface SaveCallbacks {
  onSaved: (levelId: string) => void;
  onLimit: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useSaveCustomLevel = ({ onSaved, onLimit, onError }: SaveCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...saveCustomLevelMutationOptions(),
    onSuccess: ({ id }) => onSaved(id),
    onError: (error) => {
      if (isApiError(error) && error.code === "limit_reached") onLimit();
      else onError(errorMessageKey(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: customLevelKeys.all }),
  });

  return { save: (id: string | null, level: LevelInput) => mutate({ id, level }), isPending };
};
