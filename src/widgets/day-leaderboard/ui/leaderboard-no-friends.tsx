import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./day-leaderboard-styles";

interface ILeaderboardNoFriends {
  isDisabled: boolean;
  onAddFriends: () => void;
}

const LeaderboardNoFriends = ({ isDisabled, onAddFriends }: ILeaderboardNoFriends) => {
  const { t } = useTranslation();

  return (
    <View style={styles.empty}>
      <Text variant="title.m" style={styles.emptyTitle}>
        {t("daily.addFriends")}
      </Text>
      <Button
        testID="leaderboard-add-friends"
        label={t("friends.inviteAction").toLocaleUpperCase()}
        variant="primary"
        isDisabled={isDisabled}
        onPress={onAddFriends}
      />
    </View>
  );
};

export default LeaderboardNoFriends;
