import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { typography } from "@shared/theme";

import { Text } from "../text";

import { styles } from "./text-field-styles";

export interface SecureToggle {
  show: string;
  hide: string;
}

interface ITextField extends Pick<
  TextInputProps,
  | "value"
  | "onChangeText"
  | "onBlur"
  | "placeholder"
  | "maxLength"
  | "autoComplete"
  | "keyboardType"
  | "multiline"
> {
  label: string;
  error?: string;
  counter?: string;
  hint?: ReactNode;
  secureToggle?: SecureToggle;
  testID?: string;
}

const BODY = "body.l";

const TextField = ({
  label,
  error,
  counter,
  hint,
  secureToggle,
  testID,
  onBlur,
  ...input
}: ITextField) => {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const hasError = error !== undefined;
  styles.useVariants({
    isFocused,
    hasError,
    hasToggle: secureToggle !== undefined,
    isMultiline: input.multiline === true,
  });

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text variant="body.s" style={styles.label}>
          {label}
        </Text>
        {counter === undefined ? null : (
          <Text variant="body.s" style={styles.counter}>
            {counter}
          </Text>
        )}
      </View>
      <View>
        <TextInput
          {...input}
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={error}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureToggle !== undefined && !isRevealed}
          placeholderTextColor={theme.colors.text.disabled}
          maxFontSizeMultiplier={typography[BODY].maxFontSizeMultiplier}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
        />
        {secureToggle === undefined ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? secureToggle.hide : secureToggle.show}
            onPress={() => setIsRevealed((value) => !value)}
            style={styles.toggle}
          >
            <Text variant="button.s" style={styles.toggleLabel}>
              {isRevealed ? secureToggle.hide : secureToggle.show}
            </Text>
          </Pressable>
        )}
      </View>
      {hint}
      {hasError ? (
        <Text variant="body.s" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default TextField;
