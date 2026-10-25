import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customLevelKeys, deleteCustomLevelMutationOptions } from "@entities/custom-level";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useDeleteCustomLevel = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...deleteCustomLevelMutationOptions(),
    onError: (error) => onError(errorMessageKey(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: customLevelKeys.all }),
  });

  return { remove: mutate, isPending };
};
