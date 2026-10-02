import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "../text";

import { styles } from "./screen-title-styles";

interface IScreenTitle {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}

const ScreenTitle = ({ eyebrow, title, right }: IScreenTitle) => (
  <View style={styles.row}>
    <View style={styles.texts}>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {eyebrow}
      </Text>
      <Text variant="display.l" accessibilityRole="header">
        {title}
      </Text>
    </View>
    {right}
  </View>
);

export default ScreenTitle;
