import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customLevelKeys, deleteCustomLevelMutationOptions } from "@entities/custom-level";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useDeleteCustomLevel = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...deleteCustomLevelMutationOptions(),
    // A level already deleted elsewhere is gone either way (уровень, уже удалённый в другом месте, исчез в любом случае).
    onError: (error) => {
      if (!isApiError(error) || error.code !== "level_not_found") onError(errorMessageKey(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: customLevelKeys.all }),
  });

  return { remove: mutate, isPending };
};
