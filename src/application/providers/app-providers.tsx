import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { applyLanguage } from "@shared/i18n";
import { appConfigKeys } from "@entities/app-config";
import { useSettingsStore } from "@entities/settings";
import { setHapticsEnabled } from "@shared/haptics";
import { useAppTheme } from "@shared/theme";

import { persistOptions, queryClient } from "../query/query-client";

import { styles } from "./app-providers-styles";

interface IAppProviders {
  children: ReactNode;
}

// The restored bootstrap may be stale; every launch asks the server again (восстановленный bootstrap мог устареть; каждый запуск спрашивает сервер заново).
const refetchBootstrap = () => queryClient.invalidateQueries({ queryKey: appConfigKeys.all });

const AppProviders = ({ children }: IAppProviders) => {
  const { theme, rt } = useUnistyles();
  const themeChoice = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const isVibrationOn = useSettingsStore((state) => state.isVibrationOn);
  useAppTheme(themeChoice);

  // The saved language is applied before the first paint, like the theme (сохранённый язык применяется до первой отрисовки, как и тема).
  useLayoutEffect(() => applyLanguage(language), [language]);

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
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <StatusBar style={rt.themeName === "light" ? "dark" : "light"} />
              {children}
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
};

export default AppProviders;
