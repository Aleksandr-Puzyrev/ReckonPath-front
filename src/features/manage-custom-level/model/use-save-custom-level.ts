import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  customLevelKeys,
  customLevelsQueryOptions,
  levelProblemsOf,
  saveCustomLevelMutationOptions,
  savedCustomLevelOf,
  withSavedLevel,
} from "@entities/custom-level";
import type { CustomDraft, LevelProblem } from "@entities/custom-level";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface SaveCallbacks {
  onSaved: (levelId: string, draft: CustomDraft) => void;
  onLimit: (max: number | null) => void;
  onInvalid: (problem: LevelProblem, draft: CustomDraft) => void;
  onDeletedElsewhere: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const handleSaveError = (error: unknown, draft: CustomDraft, callbacks: SaveCallbacks) => {
  if (!isApiError(error)) {
    callbacks.onError(errorMessageKey(error));
    return;
  }
  const { code, details } = error;
  const [problem] = code === "level_invalid" ? levelProblemsOf(details) : [];
  if (code === "limit_reached") {
    callbacks.onLimit(typeof details.max === "number" ? details.max : null);
  } else if (problem !== undefined) callbacks.onInvalid(problem, draft);
  else if (code === "level_not_found") callbacks.onDeletedElsewhere();
  else callbacks.onError(errorMessageKey(error));
};

export const useSaveCustomLevel = (callbacks: SaveCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...saveCustomLevelMutationOptions(),
    // The list gets the level before the editor moves to its id, so a just-saved level is never missing from it (список получает уровень раньше, чем редактор переходит на его id, поэтому только что сохранённый уровень в нём всегда есть).
    onSuccess: (view, { draft }) => {
      const saved = savedCustomLevelOf(view);
      if (saved !== null) {
        queryClient.setQueryData(customLevelsQueryOptions().queryKey, (list) =>
          list === undefined ? list : withSavedLevel(list, saved),
        );
      }
      callbacks.onSaved(view.id, draft);
    },
    onError: (error, { draft }) => handleSaveError(error, draft, callbacks),
    onSettled: () => queryClient.invalidateQueries({ queryKey: customLevelKeys.all }),
  });

  return {
    save: (id: string | null, draft: CustomDraft, norm: number | null) =>
      mutate({ id, draft, norm }),
    isPending,
  };
};
