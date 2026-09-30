import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import type { TabItem } from "../model/tab-items";

import { styles } from "./tab-bar-item-styles";

interface ITabBarItem {
  item: TabItem;
  label: string;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarItem = ({ item, label, isActive, onPress, onLongPress }: ITabBarItem) => {
  const { theme } = useUnistyles();
  styles.useVariants({ isActive });

  const { Icon } = item;
  const iconColor = isActive ? theme.colors.accent.cyan : theme.colors.text.secondary;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <Icon width={theme.sizes.icon.l} height={theme.sizes.icon.l} color={iconColor} />
      <Text variant="tab" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

export default TabBarItem;
