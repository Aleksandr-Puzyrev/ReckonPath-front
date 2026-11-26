import type * as Lottie from "lottie-react-native";

const loadLottie = (): typeof Lottie.default | null => {
  try {
    // The static preview also works in development builds made before Lottie was linked.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require("lottie-react-native") as typeof Lottie;
    return module.default;
  } catch {
    return null;
  }
};

export const LottieView = loadLottie();
