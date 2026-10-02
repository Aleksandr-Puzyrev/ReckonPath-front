import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import "@shared/i18n";
import { appConfigKeys } from "@entities/app-config";
import { useSettingsStore } from "@entities/settings";
import { setHapticsEnabled } from "@shared/haptics";
import { useSystemTheme } from "@shared/theme";

import { persistOptions, queryClient } from "../query/query-client";

import { styles } from "./app-providers-styles";

interface IAppProviders {
  children: ReactNode;
}

// The restored bootstrap may be stale; every launch asks the server again (восстановленный bootstrap мог устареть; каждый запуск спрашивает сервер заново).
const refetchBootstrap = () => queryClient.invalidateQueries({ queryKey: appConfigKeys.all });

const AppProviders = ({ children }: IAppProviders) => {
  const { theme } = useUnistyles();
  useSystemTheme();
  const isVibrationOn = useSettingsStore((state) => state.isVibrationOn);

  useEffect(() => setHapticsEnabled(isVibrationOn), [isVibrationOn]);

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(theme.colors.bg.base);
  }, [theme.colors.bg.base]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={refetchBootstrap}
    >
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <StatusBar style="auto" />
            {children}
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
};

export default AppProviders;
