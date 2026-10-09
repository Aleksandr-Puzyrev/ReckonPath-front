import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import CheckIcon from "@assets/icons/levels/check.svg";

import { Gradient } from "../gradient";
import { Text } from "../text";

import { styles } from "./checkbox-styles";

interface ICheckbox {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
  error?: string;
  testID?: string;
}

const Checkbox = ({ label, isChecked, onToggle, error, testID }: ICheckbox) => {
  const { theme } = useUnistyles();
  const hasError = error !== undefined;
  styles.useVariants({ isChecked, hasError });
  const iconSize = theme.sizes.icon.s;

  return (
    <View style={styles.field}>
      <Pressable
        testID={testID}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked: isChecked }}
        accessibilityHint={error}
        onPress={onToggle}
        style={styles.row}
      >
        <View style={styles.box}>
          {isChecked ? (
            <>
              <Gradient name="primary" radius={theme.radius.xs} />
              <CheckIcon width={iconSize} height={iconSize} color={theme.colors.text.onAccent} />
            </>
          ) : null}
        </View>
        <Text variant="body.m" style={styles.label}>
          {label}
        </Text>
      </Pressable>
      {hasError ? (
        <Text variant="body.s" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default Checkbox;
