import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { BlockPlayerDialog } from "@features/block-player";
import { ChallengeSheet, ChallengeWaiting } from "@features/challenge-friend";
import { RemoveFriendDialog } from "@features/remove-friend";
import { ReportSheet } from "@features/report-player";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import MoreIcon from "@assets/icons/friends/more.svg";
import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { usePlayerProfileScreen } from "../model/use-player-profile-screen";

import PlayerProfileBody from "./player-profile-body";
import PlayerMenu from "./player-menu";
import PlayerProfileStatus from "./player-profile-status";
import { styles } from "./player-profile-styles";

const PlayerProfileScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const screen = usePlayerProfileScreen(showToast);
  const iconSize = theme.sizes.iconButton.icon;
  // My own profile only redirects to the Profile tab, so nothing of it is drawn (свой профиль только перенаправляет во вкладку «Профиль», поэтому ничего из него не рисуется).
  const profile = screen.data?.relation === "self" ? undefined : screen.data;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="player-back"
          accessibilityLabel={t("common.back")}
          onPress={screen.handleBack}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("player.title")}
        </Text>
        {profile === undefined ? (
          <View style={styles.topSpacer} />
        ) : (
          <IconButton
            testID="player-more"
            accessibilityLabel={t("player.more")}
            isDisabled={screen.isDisabled}
            onPress={screen.handleMenuOpen}
            icon={
              <MoreIcon width={iconSize} height={iconSize} color={theme.colors.text.secondary} />
            }
          />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {screen.isOnline ? null : (
          <Text variant="body.s" style={styles.message} testID="player-offline">
            {t("friends.offlineBar")}
          </Text>
        )}
        {screen.data === undefined ? (
          <PlayerProfileStatus
            isPending={screen.isPending}
            isOnline={screen.isOnline}
            error={screen.error}
            onRetry={screen.handleRetry}
          />
        ) : null}
        {profile === undefined ? null : <PlayerProfileBody profile={profile} screen={screen} />}
      </ScrollView>
      <PlayerMenu
        profile={profile}
        isOpen={screen.sheet === "menu"}
        onReport={screen.handleReportOpen}
        onBlock={screen.handleBlock}
        onRemove={screen.handleRemove}
        onClose={screen.handleSheetClose}
      />
      <ReportSheet
        player={screen.sheet === "report" ? screen.player : null}
        report={screen.report}
        onClose={screen.handleSheetClose}
      />
      <BlockPlayerDialog block={screen.block} />
      <RemoveFriendDialog remove={screen.remove} />
      <ChallengeSheet
        friend={screen.challenge.friend}
        format={screen.challenge.format}
        isSending={screen.challenge.isSending}
        onSend={screen.challenge.handleSend}
        onClose={screen.challenge.handleClose}
      />
      <ChallengeWaiting
        waiting={screen.challenge.waiting}
        onCancel={screen.challenge.handleCancel}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default PlayerProfileScreen;
