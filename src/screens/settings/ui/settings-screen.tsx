import { router, useLocalSearchParams } from "expo-router";
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

const CHANGE_NOTICES = {
  password: "account.change.passwordDone",
  email: "account.change.emailDone",
  devices: "devices.signedOutAll",
} as const;

const isChangeNotice = (changed: string): changed is keyof typeof CHANGE_NOTICES =>
  changed in CHANGE_NOTICES;

// The brand name is not translated (название бренда не переводится).
const BRAND = "RECKON PATH";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { changed, at } = useLocalSearchParams<{
    changed?: keyof typeof CHANGE_NOTICES;
    at?: string;
  }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [notice, setNotice] = useState<ToastMessage | null>(null);
  const [noticedAt, setNoticedAt] = useState<string | undefined>(undefined);
  // A finished password or e-mail change comes back with its moment, which raises the notice once (завершённая смена пароля или e-mail возвращается со своим моментом, и он один раз поднимает сообщение).
  if (at !== noticedAt) {
    setNoticedAt(at);
    setNotice(
      at === undefined || changed === undefined || !isChangeNotice(changed)
        ? null
        : {
            id: Number(at),
            text: t(CHANGE_NOTICES[changed]),
          },
    );
  }
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
          onChangePassword={() => router.push("/account/password")}
          onChangeEmail={() => router.push("/account/email")}
          onDevices={() => router.push("/settings/devices")}
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
      <Toast
        message={toast ?? notice}
        onHide={() => (toast === null ? setNotice(null) : setToast(null))}
      />
    </Screen>
  );
};

export default SettingsScreen;
