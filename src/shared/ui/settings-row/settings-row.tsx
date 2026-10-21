import type { ComponentType, ReactNode } from "react";
import { Pressable, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "../text";

import { styles } from "./settings-row-styles";

interface ISettingsRow {
  Icon: ComponentType<SvgProps>;
  iconColor: string;
  label: string;
  subtitle?: string;
  isFirst?: boolean;
  isDestructive?: boolean;
  accessory?: ReactNode;
  children?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

const SettingsRow = ({
  Icon,
  iconColor,
  label,
  subtitle,
  isFirst = false,
  isDestructive = false,
  accessory,
  children,
  onPress,
  testID,
}: ISettingsRow) => {
  const { theme } = useUnistyles();
  styles.useVariants({ isDestructive });
  const iconSize = theme.sizes.icon.m;

  const main = (
    <View style={styles.main}>
      <View style={[styles.tile, { backgroundColor: iconColor }]}>
        <Icon width={iconSize} height={iconSize} color={theme.colors.text.onAccent} />
      </View>
      <View style={styles.texts}>
        <Text variant="body.m" style={styles.label}>
          {label}
        </Text>
        {subtitle === undefined ? null : (
          <Text variant="caption" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {accessory}
    </View>
  );

  const rowStyle = [styles.row, isFirst ? null : styles.divider];
  const extra = children === undefined ? null : <View style={styles.extra}>{children}</View>;

  if (onPress === undefined) {
    return (
      <View style={rowStyle} testID={testID}>
        {main}
        {extra}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed ? styles.pressed : null]}
    >
      {main}
      {extra}
    </Pressable>
  );
};

export default SettingsRow;
