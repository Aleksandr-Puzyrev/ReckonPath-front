import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import "@shared/i18n";

import { styles } from "./app-providers-styles";

interface IAppProviders {
  children: ReactNode;
}

const AppProviders = ({ children }: IAppProviders) => {
  const { theme } = useUnistyles();

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(theme.colors.bg.base);
  }, [theme.colors.bg.base]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />
          {children}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppProviders;
