import { Tabs } from "expo-router/tabs";

import { TabBar, useTabTransition } from "@widgets/tab-bar";

const TabsLayout = () => {
  const tabTransition = useTabTransition();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, ...tabTransition }}
    />
  );
};

export default TabsLayout;
