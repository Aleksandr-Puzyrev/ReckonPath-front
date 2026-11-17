import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import type { TabItem } from "../model/tab-items";

import { styles } from "./tab-bar-item-styles";

interface ITabBarItem {
  item: TabItem;
  label: string;
  accessibilityLabel: string;
  isActive: boolean;
  hasDot?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarItem = ({
  item,
  label,
  accessibilityLabel,
  isActive,
  hasDot = false,
  onPress,
  onLongPress,
}: ITabBarItem) => {
  const { theme } = useUnistyles();
  styles.useVariants({ isActive });

  const { Icon } = item;
  const iconColor = isActive ? theme.colors.accent.cyan : theme.colors.text.secondary;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <View>
        <Icon width={theme.sizes.icon.l} height={theme.sizes.icon.l} color={iconColor} />
        {hasDot ? <View style={styles.dot} testID={`tab-dot-${item.routeName}`} /> : null}
      </View>
      <Text variant="tab" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

export default TabBarItem;
