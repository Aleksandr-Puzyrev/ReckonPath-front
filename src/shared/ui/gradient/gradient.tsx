import { Canvas, LinearGradient, RoundedRect, vec } from "@shopify/react-native-skia";
import { useState } from "react";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@shared/theme";

import { gradientPoints } from "./gradient-points";
import { styles } from "./gradient-styles";

export type GradientName = keyof AppTheme["gradients"];

interface IGradient {
  name: GradientName;
  radius?: number;
}

const Gradient = ({ name, radius = 0 }: IGradient) => {
  const { theme } = useUnistyles();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gradient = theme.gradients[name];
  const { start, end } = gradientPoints(gradient.angle, size.width, size.height);

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height });

  return (
    <View style={styles.fill} pointerEvents="none" onLayout={handleLayout}>
      <Canvas style={styles.canvas}>
        <RoundedRect x={0} y={0} width={size.width} height={size.height} r={radius}>
          <LinearGradient
            start={vec(start.x, start.y)}
            end={vec(end.x, end.y)}
            colors={[...gradient.colors]}
            positions={"locations" in gradient ? [...gradient.locations] : undefined}
          />
        </RoundedRect>
      </Canvas>
    </View>
  );
};

export default Gradient;
