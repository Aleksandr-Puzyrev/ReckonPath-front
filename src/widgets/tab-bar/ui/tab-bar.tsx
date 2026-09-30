import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet as NativeStyleSheet, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { createTabPressHandlers } from "../model/create-tab-press-handlers";
import { TAB_ITEMS } from "../model/tab-items";

import { styles } from "./tab-bar-styles";
import TabBarItem from "./tab-bar-item";

const isBlurSupported = Platform.OS === "ios";

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { t } = useTranslation();
  const { theme, rt } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        {isBlurSupported && (
          <BlurView
            intensity={theme.sizes.tabBar.blur}
            tint={rt.themeName === "dark" ? "dark" : "light"}
            style={NativeStyleSheet.absoluteFill}
          />
        )}
        {TAB_ITEMS.map((item) => {
          const route = state.routes.find(({ name }) => name === item.routeName);
          if (!route) return null;

          const isActive = state.routes[state.index]?.key === route.key;
          const { onPress, onLongPress } = createTabPressHandlers(navigation, route, isActive);

          return (
            <TabBarItem
              key={route.key}
              item={item}
              label={t(item.labelKey)}
              isActive={isActive}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;
