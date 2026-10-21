import { useState } from "react";
import { View } from "react-native";
import type { AccessibilityActionEvent, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Text } from "../text";

import { styles } from "./slider-styles";

interface ISlider {
  label: string;
  value: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  testID?: string;
}

const PERCENT = 100;

const Slider = ({ label, value, max, step, onChange, testID }: ISlider) => {
  const [width, setWidth] = useState(0);
  const share = value / max;

  const pick = (x: number) => {
    if (width === 0) return;
    const raw = (Math.min(Math.max(x, 0), width) / width) * max;
    const next = Math.round(raw / step) * step;
    if (next !== value) onChange(next);
  };

  const pan = Gesture.Pan()
    .withTestId(`${testID ?? "slider"}-pan`)
    .runOnJS(true)
    .minDistance(0)
    .onBegin(({ x }) => pick(x))
    .onUpdate(({ x }) => pick(x));

  const handleAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    const delta = nativeEvent.actionName === "increment" ? step : -step;
    onChange(Math.min(Math.max(value + delta, 0), max));
  };

  return (
    <View style={styles.row}>
      <GestureDetector gesture={pan}>
        <View
          testID={testID}
          style={styles.area}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: 0, max, now: value }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={handleAction}
          onLayout={({ nativeEvent }: LayoutChangeEvent) => setWidth(nativeEvent.layout.width)}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${share * PERCENT}%` }]} />
          </View>
          <View style={[styles.thumb, { left: share * width }]} />
        </View>
      </GestureDetector>
      <Text variant="caption" style={styles.value}>{`${Math.round(share * PERCENT)}%`}</Text>
    </View>
  );
};

export default Slider;
