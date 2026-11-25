import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import LeaderboardsNoFriends from "./leaderboards-no-friends";
import LeaderboardsStatus from "./leaderboards-status";
import { styles } from "./leaderboards-styles";

interface ILeaderboardsEmpty {
  hasData: boolean;
  isNoFriends: boolean;
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
  onInvite: () => void;
}

const LeaderboardsEmpty = ({
  hasData,
  isNoFriends,
  isPending,
  isOnline,
  error,
  onRetry,
  onInvite,
}: ILeaderboardsEmpty) => {
  const { t } = useTranslation();

  if (isNoFriends) return <LeaderboardsNoFriends isDisabled={!isOnline} onInvite={onInvite} />;
  if (!hasData) {
    return (
      <LeaderboardsStatus
        isPending={isPending}
        isOnline={isOnline}
        error={error}
        onRetry={onRetry}
      />
    );
  }
  return (
    <View style={styles.empty}>
      <Text variant="body.m" style={styles.message}>
        {t("leaderboard.empty")}
      </Text>
    </View>
  );
};

export default LeaderboardsEmpty;
