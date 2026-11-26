import type { ReactNode } from "react";
import { useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { LottieView, useShopAnimation } from "@entities/item";
import type { AnimationTheme } from "@entities/item";

import { styles } from "./preview-details-styles";

interface IAnimationPreview {
  animation: AnimationTheme;
  loop: boolean;
  fallback: ReactNode;
}

const AnimationPreview = ({ animation, loop, fallback }: IAnimationPreview) => {
  const { data } = useShopAnimation(animation.url);
  const reduceMotion = useReducedMotion();
  const [hasFailed, setHasFailed] = useState(false);

  if (data === undefined || hasFailed || LottieView === null) return fallback;

  return (
    <LottieView
      testID="shop-animation-preview"
      source={data}
      autoPlay={!reduceMotion}
      loop={!reduceMotion && loop}
      {...(reduceMotion ? { progress: 1 } : {})}
      colorFilters={animation.colorFilters}
      onAnimationFailure={() => setHasFailed(true)}
      style={styles.animation}
    />
  );
};

export default AnimationPreview;
