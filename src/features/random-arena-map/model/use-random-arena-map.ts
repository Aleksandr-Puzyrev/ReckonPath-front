import { useMutation } from "@tanstack/react-query";

import { randomArenaMapMutationOptions } from "@entities/arena-map";
import type { PvpMap } from "@entities/arena-map";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface RandomCallbacks {
  onMap: (map: PvpMap) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useRandomArenaMap = ({ onMap, onError }: RandomCallbacks) => {
  const { mutate, isPending } = useMutation({
    ...randomArenaMapMutationOptions(),
    onSuccess: ({ map }) => onMap(map),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { requestRandom: mutate, isPending };
};
