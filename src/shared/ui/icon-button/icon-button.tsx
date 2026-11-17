import type { ReactNode } from "react";
import { Pressable } from "react-native";

import { styles } from "./icon-button-styles";

interface IIconButton {
  icon: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  isDisabled?: boolean;
  testID?: string;
}

const IconButton = ({
  icon,
  accessibilityLabel,
  onPress,
  isDisabled = false,
  testID,
}: IIconButton) => {
  styles.useVariants({ isDisabled });

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {icon}
    </Pressable>
  );
};

export default IconButton;
