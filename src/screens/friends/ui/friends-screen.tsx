import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { ChallengeSheet, ChallengeWaiting } from "@features/challenge-friend";
import { BlockPlayerDialog } from "@features/block-player";
import { RemoveFriendDialog } from "@features/remove-friend";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Segmented } from "@shared/ui/segmented";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { AddFriendSheet } from "@widgets/add-friend-sheet";

import PlusIcon from "@assets/icons/daily/plus.svg";
import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useFriendsScreen } from "../model/use-friends-screen";

import FriendMenu from "./friend-menu";
import FriendsListEmpty from "./friends-list-empty";
import FriendsListItem from "./friends-list-item";
import { styles } from "./friends-screen-styles";

const FriendsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const screen = useFriendsScreen(showToast);
  const iconSize = theme.sizes.iconButton.icon;
  const incoming = screen.list?.counts.incoming ?? 0;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="friends-back"
          accessibilityLabel={t("common.back")}
          onPress={screen.handleBack}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("friends.title")}
        </Text>
        <IconButton
          testID="friends-add"
          accessibilityLabel={t("friends.addFriend")}
          isDisabled={!screen.isOnline}
          onPress={screen.handleAddOpen}
          icon={<PlusIcon width={iconSize} height={iconSize} color={theme.colors.accent.cyan} />}
        />
      </View>
      <View style={styles.head}>
        {screen.isOnline ? null : (
          <Text variant="body.s" style={styles.offline} testID="friends-offline">
            {t("friends.offlineBar")}
          </Text>
        )}
        <Segmented
          testID="friends-tab"
          options={[
            { value: "friends", label: t("friends.title") },
            {
              value: "requests",
              label:
                incoming > 0
                  ? t("friends.requestsCount", { count: incoming })
                  : t("friends.requests"),
            },
          ]}
          value={screen.tab}
          onChange={screen.handleTabChange}
        />
      </View>
      <FlashList
        data={screen.rows}
        extraData={screen.rowState}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.kind}
        contentContainerStyle={styles.content}
        refreshing={screen.isRefreshing}
        onRefresh={screen.isOnline ? () => void screen.handleRefresh() : undefined}
        ListEmptyComponent={
          <FriendsListEmpty
            list={screen.list}
            tab={screen.tab}
            isPending={screen.isPending}
            isOnline={screen.isOnline}
            error={screen.error}
            onRetry={screen.handleRetry}
            onInvite={screen.handleAddOpen}
          />
        }
        renderItem={({ item }) => (
          <FriendsListItem
            row={item}
            isDisabled={screen.isDisabled}
            challengeLockReason={screen.challengeLockReason}
            removingId={screen.remove.removingId}
            onChallenge={screen.challenge.handleChallenge}
            onMore={screen.handleMore}
            onOpenProfile={screen.handleOpenProfile}
            onAccept={screen.answer.accept}
            onDecline={screen.answer.decline}
            onWithdraw={screen.answer.withdraw}
          />
        )}
      />
      <AddFriendSheet
        isOpen={screen.isAddOpen}
        isOnline={screen.isOnline}
        onToast={showToast}
        onClose={screen.handleAddClose}
        onOpenProfile={screen.handleOpenFoundProfile}
      />
      <FriendMenu
        friend={screen.menuFriend}
        onBlock={screen.block.ask}
        onRemove={screen.remove.ask}
        onClose={screen.handleMenuClose}
      />
      <RemoveFriendDialog remove={screen.remove} />
      <BlockPlayerDialog block={screen.block} />
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

export default FriendsScreen;
