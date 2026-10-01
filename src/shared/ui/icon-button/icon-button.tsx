import type { ReactNode } from "react";
import { Pressable } from "react-native";

import { styles } from "./icon-button-styles";

interface IIconButton {
  icon: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

const IconButton = ({ icon, accessibilityLabel, onPress, testID }: IIconButton) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    {icon}
  </Pressable>
);

export default IconButton;
