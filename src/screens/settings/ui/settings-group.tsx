import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./settings-styles";

interface ISettingsGroup {
  title: string;
  children: ReactNode;
}

const SettingsGroup = ({ title, children }: ISettingsGroup) => (
  <View style={styles.group}>
    <Text variant="eyebrow" style={styles.groupTitle} accessibilityRole="header">
      {title}
    </Text>
    <View style={styles.card}>{children}</View>
  </View>
);

export default SettingsGroup;
