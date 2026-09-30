import type { BottomTabNavigationOptions } from "expo-router/tabs";
import { Easing } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { motion } from "@shared/theme";

const TAB_SHIFT_DISTANCE = 5;

type TabTransition = Pick<BottomTabNavigationOptions, "transitionSpec" | "sceneStyleInterpolator">;

export const createTabTransition = (isReducedMotion: boolean): TabTransition => {
  const shift = isReducedMotion ? 0 : TAB_SHIFT_DISTANCE;

  return {
    transitionSpec: {
      animation: "timing",
      config: {
        duration: motion.duration.base,
        easing: Easing.bezier(...motion.easing.standard),
      },
    },
    sceneStyleInterpolator: ({ current }) => ({
      sceneStyle: {
        opacity: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 1, 0],
        }),
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-shift, 0, shift],
            }),
          },
        ],
      },
    }),
  };
};

export const useTabTransition = () => createTabTransition(useReducedMotion());
