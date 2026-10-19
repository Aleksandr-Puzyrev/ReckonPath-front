import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arenaKeys } from "@entities/arena";
import {
  activateArenaMapMutationOptions,
  arenaMapKeys,
  saveArenaMapMutationOptions,
} from "@entities/arena-map";
import type { ArenaMapInput } from "@entities/arena-map";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface SaveCallbacks {
  onSaved: (mapId: string) => void;
  onActivated: (mapId: string) => void;
  onDraft: () => void;
  onMapsLimit: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const hasCode = (error: unknown, code: string) => isApiError(error) && error.code === code;

// A valid map becomes active right after saving; a draft stays inactive (валидная карта сразу становится активной; черновик остаётся неактивным).
export const useSaveArenaMap = ({
  onSaved,
  onActivated,
  onDraft,
  onMapsLimit,
  onError,
}: SaveCallbacks) => {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: arenaKeys.all }),
      queryClient.invalidateQueries({ queryKey: arenaMapKeys.all }),
    ]);

  const activate = useMutation({
    ...activateArenaMapMutationOptions(),
    onSuccess: ({ activeMapId }) => onActivated(activeMapId),
    onError: (error) => {
      if (hasCode(error, "MAP_INVALID")) onDraft();
      else onError(errorMessageKey(error));
    },
    onSettled: refresh,
  });

  const save = useMutation({
    ...saveArenaMapMutationOptions(),
    onSuccess: (map) => {
      onSaved(map.id);
      if (map.valid) return;
      onDraft();
      void refresh();
    },
    onError: (error) => {
      if (hasCode(error, "LIMIT_REACHED")) onMapsLimit();
      else onError(errorMessageKey(error));
    },
  });

  // A follow-up is passed with the call: mutation callbacks keep the closure of the render that started them (продолжение передаётся с вызовом: колбэки мутации хранят замыкание рендера, который их запустил).
  const run = (id: string | null, input: ArenaMapInput, onFinish?: () => void) =>
    save.mutate(
      { id, input },
      {
        onSuccess: (map) => {
          if (!map.valid) {
            onFinish?.();
            return;
          }
          activate.mutate(map.id, {
            onSuccess: () => onFinish?.(),
            onError: (error) => {
              if (hasCode(error, "MAP_INVALID")) onFinish?.();
            },
          });
        },
      },
    );

  return {
    save: run,
    isPending: save.isPending || activate.isPending,
  };
};
