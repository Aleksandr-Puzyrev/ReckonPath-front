import { useUnistyles } from "react-native-unistyles";

import { useSettingsStore } from "@entities/settings";

// The labels take a strip of the given width, so the board shrinks by it (подписи занимают полосу заданной ширины, и поле уменьшается на неё).
export const useCoordinatesSize = (size: number) => {
  const { theme } = useUnistyles();
  const isCoordinatesOn = useSettingsStore((state) => state.isCoordinatesOn);
  return {
    isCoordinatesOn,
    boardSize: isCoordinatesOn ? size - theme.sizes.arena.coordinates : size,
  };
};
