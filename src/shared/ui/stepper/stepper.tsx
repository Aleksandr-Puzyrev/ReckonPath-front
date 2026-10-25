import { Pressable, View } from "react-native";
import type { AccessibilityActionEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import MinusIcon from "@assets/icons/settings/minus.svg";
import PlusIcon from "@assets/icons/daily/plus.svg";

import { Text } from "../text";

import { styles } from "./stepper-styles";

interface IStepper {
  label: string;
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
  testID?: string;
}

const Stepper = ({
  label,
  value,
  min,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
  testID,
}: IStepper) => {
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;
  const colorOf = (isEnabled: boolean) =>
    isEnabled ? theme.colors.text.primary : theme.colors.text.disabled;
  const canDecrease = value > min;
  const canIncrease = value < max;

  const handleAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    if (nativeEvent.actionName === "increment" && canIncrease) onChange(value + 1);
    if (nativeEvent.actionName === "decrement" && canDecrease) onChange(value - 1);
  };

  return (
    <View
      style={styles.row}
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={handleAction}
    >
      <Text variant="body.m" style={styles.label}>
        {label}
      </Text>
      <View style={styles.controls}>
        <Pressable
          testID={testID === undefined ? undefined : `${testID}-minus`}
          accessibilityRole="button"
          accessibilityLabel={decreaseLabel}
          disabled={!canDecrease}
          onPress={() => onChange(value - 1)}
          style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
        >
          <MinusIcon width={iconSize} height={iconSize} color={colorOf(canDecrease)} />
        </Pressable>
        <Text variant="title.m" style={styles.value}>
          {String(value)}
        </Text>
        <Pressable
          testID={testID === undefined ? undefined : `${testID}-plus`}
          accessibilityRole="button"
          accessibilityLabel={increaseLabel}
          disabled={!canIncrease}
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
        >
          <PlusIcon width={iconSize} height={iconSize} color={colorOf(canIncrease)} />
        </Pressable>
      </View>
    </View>
  );
};

export default Stepper;
