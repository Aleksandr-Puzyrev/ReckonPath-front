import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useUnistyles } from "react-native-unistyles";

import { styles } from "./arena-match-styles";

interface ITimerRing {
  share: number;
  color: string;
  children: ReactNode;
}

const TimerRing = ({ share, color, children }: ITimerRing) => {
  const { theme } = useUnistyles();
  const { size, stroke } = theme.sizes.timerRing;
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;

  return (
    <View style={styles.ring}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.bg.sunken}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - share)}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
};

export default TimerRing;
