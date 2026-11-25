import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Segmented } from "@shared/ui/segmented";
import { Text } from "@shared/ui/text";
import { ArenaLeaderMine, ArenaLeaderRow } from "@widgets/arena-leaders";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useLeaderboardsScreen } from "../model/use-leaderboards-screen";

import LeaderboardsEmpty from "./leaderboards-empty";
import { styles } from "./leaderboards-styles";

const LeaderboardsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const screen = useLeaderboardsScreen();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="leaderboards-back"
          accessibilityLabel={t("common.back")}
          onPress={screen.handleBack}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("leaderboard.title")}
        </Text>
        <View style={styles.topSpacer} />
      </View>
      <View style={styles.head}>
        {screen.isOnline ? null : (
          <Text variant="body.s" style={styles.message} testID="leaderboards-offline">
            {t("friends.offlineBar")}
          </Text>
        )}
        <Segmented
          testID="leaderboards-period"
          options={[
            { value: "week", label: t("leaderboard.week") },
            { value: "season", label: t("leaderboard.season") },
          ]}
          value={screen.period}
          onChange={screen.handlePeriodChange}
        />
        <View style={styles.scopeRow}>
          <View style={styles.scope}>
            <Segmented
              testID="leaderboards-scope"
              options={[
                { value: "all", label: t("daily.scope.all") },
                { value: "friends", label: t("daily.scope.friends") },
              ]}
              value={screen.scope}
              onChange={screen.handleScopeChange}
            />
          </View>
          {screen.timer === null ? null : (
            <Text variant="caption" style={styles.secondary} testID="leaderboards-timer">
              {screen.timer}
            </Text>
          )}
        </View>
      </View>
      <FlashList
        data={screen.rows}
        extraData={screen.me?.id}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.content}
        refreshing={screen.isRefreshing}
        onRefresh={screen.isOnline ? () => void screen.handleRefresh() : undefined}
        ListEmptyComponent={
          <LeaderboardsEmpty
            hasData={screen.hasData}
            isNoFriends={screen.isNoFriends}
            isPending={screen.isPending}
            isOnline={screen.isOnline}
            error={screen.error}
            onRetry={screen.handleRetry}
            onInvite={screen.handleInvite}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ArenaLeaderRow
              row={item}
              kind="card"
              isMine={item.id === screen.me?.id}
              hasAvatar
              onOpenProfile={screen.handleOpenProfile}
            />
          </View>
        )}
      />
      {screen.rows.length === 0 ? null : (
        <View style={styles.pinned} testID="leaderboards-mine">
          <ArenaLeaderMine me={screen.me} period={screen.period} kind="card" />
        </View>
      )}
    </Screen>
  );
};

export default LeaderboardsScreen;
