import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FriendAvatar } from "@entities/friend";
import type { Friend } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./blocked-players-styles";

interface IBlockedPlayerRow {
  player: Friend;
  isDisabled: boolean;
  onUnblock: (player: Friend) => void;
}

const BlockedPlayerRow = ({ player, isDisabled, onUnblock }: IBlockedPlayerRow) => {
  const { t } = useTranslation();

  return (
    <View style={styles.row} testID={`blocked-${player.id}`}>
      <FriendAvatar name={player.name} size="match" />
      <Text variant="title.s" style={styles.name} numberOfLines={1}>
        {player.name}
      </Text>
      <Button
        testID={`blocked-unblock-${player.id}`}
        label={t("block.unblock")}
        accessibilityLabel={`${t("block.unblock")}, ${player.name}`}
        variant="secondary"
        size="s"
        isDisabled={isDisabled}
        onPress={() => onUnblock(player)}
      />
    </View>
  );
};

export default BlockedPlayerRow;
