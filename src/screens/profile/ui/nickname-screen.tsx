import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { NicknameForm } from "@features/change-nickname";
import { useMeQuery } from "@entities/wallet";
import { useIsOnline } from "@shared/api";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { EarnSheet } from "@widgets/earn-sheet";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { NICKNAME_CHANGED_NOTICE } from "../model/profile-notice";

import ProfileStatus from "./profile-status";
import { styles } from "./nickname-screen-styles";

const NicknameScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const me = useMeQuery();
  const isOnline = useIsOnline();
  const [shortBy, setShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="nickname-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("nick.title")}
        </Text>
        <View style={styles.side} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {me.data === undefined ? (
          <ProfileStatus
            isPending={me.isPending}
            isOnline={isOnline}
            onRetry={() => void me.refetch()}
          />
        ) : (
          <NicknameForm
            me={me.data}
            onChanged={() =>
              router.dismissTo({
                pathname: "/profile",
                params: { notice: NICKNAME_CHANGED_NOTICE },
              })
            }
            onShortOfEmeralds={setShortBy}
            onError={(messageKey) => showToast(t(messageKey))}
          />
        )}
      </ScrollView>
      <EarnSheet
        isOpen={shortBy !== null}
        shortBy={shortBy}
        onDaily={() => {
          setShortBy(null);
          router.push("/daily");
        }}
        onMessage={(messageKey) => showToast(t(messageKey))}
        onClose={() => setShortBy(null)}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default NicknameScreen;
