import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./leaderboards-styles";

interface ILeaderboardsNoFriends {
  isDisabled: boolean;
  onInvite: () => void;
}

const LeaderboardsNoFriends = ({ isDisabled, onInvite }: ILeaderboardsNoFriends) => {
  const { t } = useTranslation();

  return (
    <View style={styles.empty}>
      <Text variant="title.l" style={styles.emptyTitle}>
        {t("daily.addFriends")}
      </Text>
      <Text variant="body.m" style={styles.message}>
        {t("leaderboard.noFriends")}
      </Text>
      <Button
        testID="leaderboards-invite"
        label={t("friends.inviteAction").toLocaleUpperCase()}
        variant="primary"
        size="l"
        isDisabled={isDisabled}
        onPress={onInvite}
      />
    </View>
  );
};

export default LeaderboardsNoFriends;
