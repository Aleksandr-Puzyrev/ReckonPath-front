import type { ComponentType } from "react";
import { View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { useUnistyles } from "react-native-unistyles";

import { styles } from "./system-illustration-styles";

export type IllustrationTone = "accent" | "warning";

interface ISystemIllustration {
  tone: IllustrationTone;
  Icon: ComponentType<SvgProps>;
}

const SystemIllustration = ({ tone, Icon }: ISystemIllustration) => {
  const { theme } = useUnistyles();
  styles.useVariants({ tone });
  const { size, ringGap, icon } = theme.sizes.systemIllustration;
  const ringSizes = Array.from(
    { length: Math.floor(size / 2 / ringGap) },
    (_, index) => (index + 1) * ringGap * 2,
  );
  const iconColor = tone === "accent" ? theme.colors.accent.cyan : theme.colors.status.warning;

  return (
    <View style={styles.root} importantForAccessibility="no-hide-descendants">
      {ringSizes.map((ringSize) => (
        <View key={ringSize} style={[styles.ring, { width: ringSize, height: ringSize }]} />
      ))}
      <View style={styles.tile}>
        <View style={styles.tint} />
        <Icon width={icon} height={icon} color={iconColor} />
      </View>
    </View>
  );
};

export default SystemIllustration;
