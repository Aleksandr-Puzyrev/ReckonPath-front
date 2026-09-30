import type { BottomTabBarProps } from "expo-router/tabs";

type Navigation = BottomTabBarProps["navigation"];
type Route = BottomTabBarProps["state"]["routes"][number];

// Screens listen to tabPress, e.g. to scroll to top on a repeated press (экраны слушают tabPress, например чтобы прокрутить наверх при повторном нажатии).
export const createTabPressHandlers = (
  navigation: Navigation,
  route: Route,
  isActive: boolean,
) => ({
  onPress: () => {
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isActive && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  },
  onLongPress: () => {
    navigation.emit({ type: "tabLongPress", target: route.key });
  },
});
