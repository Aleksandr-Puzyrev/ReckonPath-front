import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "../gradient";
import { Text } from "../text";

import { styles } from "./button-styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "l" | "m" | "s";

interface IButton {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  onDisabledPress?: () => void;
  isLabelDanger?: boolean;
  caption?: string;
  icon?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const TEXT_VARIANT = { l: "button.l", m: "button.m", s: "button.s" } as const;

const Button = ({
  label,
  onPress,
  variant = "secondary",
  size = "m",
  isDisabled = false,
  onDisabledPress,
  isLabelDanger = false,
  caption,
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: IButton) => {
  const { theme } = useUnistyles();
  styles.useVariants({ variant, size, isDisabled, isLabelDanger });
  const hasGradient = variant === "primary" && !isDisabled;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={[accessibilityLabel ?? label, caption].filter(Boolean).join(", ")}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      // Pressable's own disabled would overwrite the announced state, so a button that explains itself leaves it unset (собственный disabled у Pressable перезаписал бы объявленное состояние, поэтому кнопка, объясняющая причину, его не задаёт).
      disabled={onDisabledPress === undefined ? isDisabled : undefined}
      onPress={isDisabled ? onDisabledPress : onPress}
      style={({ pressed }) => [styles.button, pressed && !isDisabled && styles.pressed]}
    >
      {hasGradient ? <Gradient name="primary" radius={theme.radius.l} /> : null}
      <View style={styles.content}>
        {icon}
        <View>
          <Text variant={TEXT_VARIANT[size]} style={styles.label}>
            {label}
          </Text>
          {caption === undefined ? null : (
            <Text variant="caption" style={styles.caption}>
              {caption}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default Button;
