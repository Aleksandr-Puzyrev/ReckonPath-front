import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { errorMessageKey, useIsOnline } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";
import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { styles } from "./settings-styles";

interface IHistoryScreen {
  title: string;
  empty: string;
  isEmpty: boolean;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  children: ReactNode;
}

const HistoryScreen = ({
  title,
  empty,
  isEmpty,
  isLoading,
  error,
  onRetry,
  children,
}: IHistoryScreen) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isOnline = useIsOnline();
  const size = theme.sizes.iconButton.icon;
  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          accessibilityLabel={t("common.back")}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/settings");
          }}
          icon={<ChevronLeftIcon width={size} height={size} color={theme.colors.text.primary} />}
        />
        <Text variant="title.m" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.side} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!HAS_BACKEND && <Text variant="body.s">{t("competition.unavailable")}</Text>}
        {!isOnline && <Text variant="body.s">{t("competition.offline")}</Text>}
        {isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
        {error && (
          <>
            <Text variant="body.s">{t(errorMessageKey(error))}</Text>
            <Button label={t("common.retry")} isDisabled={!isOnline} onPress={onRetry} />
          </>
        )}
        {isEmpty && <Text variant="body.s">{empty}</Text>}
        {children}
      </ScrollView>
    </Screen>
  );
};

export default HistoryScreen;
