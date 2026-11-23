import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useBlocksQuery } from "@entities/player";
import { useBlockPlayer } from "@features/block-player";
import { useIsOnline } from "@shared/api";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import BlockedPlayerRow from "./blocked-player-row";
import BlockedPlayersStatus from "./blocked-players-status";
import { styles } from "./blocked-players-styles";

const BlockedPlayersScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const blocks = useBlocksQuery();
  const block = useBlockPlayer(showToast);
  const isOnline = useIsOnline();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="blocked-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("settings.blockedPlayers")}
        </Text>
        <View style={styles.topSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {isOnline ? null : (
          <Text variant="body.s" style={styles.message} testID="blocked-offline">
            {t("friends.offlineBar")}
          </Text>
        )}
        {blocks.data === undefined ? (
          <BlockedPlayersStatus
            isPending={blocks.isPending}
            isOnline={isOnline}
            error={blocks.error}
            onRetry={() => void blocks.refetch()}
          />
        ) : null}
        {blocks.data?.length === 0 ? (
          <Text variant="body.m" style={styles.message} testID="blocked-empty">
            {t("settings.blockedEmpty")}
          </Text>
        ) : null}
        {blocks.data?.map((player) => (
          <BlockedPlayerRow
            key={player.id}
            player={player}
            isDisabled={!isOnline || block.isPending}
            onUnblock={block.unblock}
          />
        ))}
      </ScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default BlockedPlayersScreen;
