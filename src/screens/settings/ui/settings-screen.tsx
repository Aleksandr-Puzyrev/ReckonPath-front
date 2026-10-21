import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useSettingsScreen } from "../model/use-settings-screen";

import AboutGroup from "./about-group";
import AccountGroup from "./account-group";
import GameGroup from "./game-group";
import HelpGroup from "./help-group";
import LookGroup from "./look-group";
import SettingsSheets from "./settings-sheets";
import { styles } from "./settings-styles";

// The brand name is not translated (название бренда не переводится).
const BRAND = "RECKON PATH";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const screen = useSettingsScreen(showToast);
  const iconSize = theme.sizes.iconButton.icon;
  const versionLabel =
    screen.build === null ? screen.version : `${screen.version} (${screen.build})`;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="settings-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("settings.title")}
        </Text>
        <View style={styles.side} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <GameGroup />
        <LookGroup onLanguage={screen.handleLanguage} />
        <AccountGroup
          nickname={screen.me?.nickname ?? null}
          hasLogin={screen.hasLogin}
          deletionAt={screen.deletionAt}
          isSigningOut={screen.isSigningOut}
          onLink={() => screen.handleSheet("link")}
          onSignOut={screen.handleSignOut}
          onDelete={() => screen.handleSheet("delete")}
          onDeletion={screen.handleDeletion}
        />
        <HelpGroup
          onRules={() => screen.handleSheet("rules")}
          onSupport={() => screen.handleSheet("support")}
        />
        <AboutGroup
          versionLabel={versionLabel}
          playerId={screen.me?.id ?? null}
          onCopyId={screen.handleCopyId}
          onRate={screen.handleRate}
        />
        <View style={styles.footer}>
          <Text variant="caption" style={styles.value}>{`${BRAND} · ${versionLabel}`}</Text>
          <Text variant="caption" style={styles.value}>
            {t("settings.made")}
          </Text>
        </View>
      </ScrollView>
      <SettingsSheets screen={screen} onToast={showToast} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default SettingsScreen;
