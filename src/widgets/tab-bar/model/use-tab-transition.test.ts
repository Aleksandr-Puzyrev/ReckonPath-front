import { createTabTransition } from "./use-tab-transition";

type InterpolationConfig = { inputRange: number[]; outputRange: number[] };

// Returning the config lets the test read it (возвращаем конфиг, чтобы тест мог его прочитать).
const runInterpolator = (isReducedMotion: boolean) => {
  const { sceneStyleInterpolator } = createTabTransition(isReducedMotion);
  const progress = { interpolate: (config: InterpolationConfig) => config };
  const result = sceneStyleInterpolator?.({ current: { progress } } as never);

  return result?.sceneStyle as unknown as {
    opacity: InterpolationConfig;
    transform: [{ translateX: InterpolationConfig }];
  };
};

describe("createTabTransition", () => {
  test("fades and shifts the scene by 5 pt", () => {
    const sceneStyle = runInterpolator(false);

    expect(sceneStyle.opacity.outputRange).toEqual([0, 1, 0]);
    expect(sceneStyle.transform[0].translateX.outputRange).toEqual([-5, 0, 5]);
  });

  test("keeps only the fade when reduced motion is on", () => {
    const sceneStyle = runInterpolator(true);

    expect(sceneStyle.opacity.outputRange).toEqual([0, 1, 0]);
    expect(sceneStyle.transform[0].translateX.outputRange).toEqual([-0, 0, 0]);
  });

  test("uses the base duration from the motion tokens", () => {
    const { transitionSpec } = createTabTransition(false);

    expect(transitionSpec).toEqual(
      expect.objectContaining({
        animation: "timing",
        config: expect.objectContaining({ duration: 220 }),
      }),
    );
  });
});
