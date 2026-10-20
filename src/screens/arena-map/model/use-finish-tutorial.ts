import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arenaKeys, completeOnboardingMutationOptions } from "@entities/arena";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useFinishTutorial = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const complete = useMutation({
    ...completeOnboardingMutationOptions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arenaKeys.all }),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    finish: (onDone: () => void) => complete.mutate(undefined, { onSuccess: onDone }),
    isPending: complete.isPending,
  };
};
