import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FriendAvatar, relationActionOf } from "@entities/friend";
import type { FoundPlayer, RelationAction } from "@entities/friend";
import { PlayerLink } from "@entities/player";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./add-friend-sheet-styles";

interface IFoundPlayerRow {
  player: FoundPlayer;
  isDisabled: boolean;
  onSend: (player: FoundPlayer) => void;
  onOpenProfile: (player: FoundPlayer) => void;
}

const LABEL_KEY = {
  add: "friends.add",
  sent: "friends.sent",
  accept: "friends.accept",
  friend: "friends.isFriend",
} as const satisfies Partial<Record<RelationAction, string>>;

// Only a stranger or a player who has asked me can be sent a request; the rest is a status (заявку можно отправить только незнакомцу или тому, кто звал меня; остальное — статус).
const FoundPlayerRow = ({ player, isDisabled, onSend, onOpenProfile }: IFoundPlayerRow) => {
  const { t } = useTranslation();
  const action = relationActionOf(player.relation);
  const isActionable = action === "add" || action === "accept";

  return (
    <View style={styles.player} testID={`found-${player.id}`}>
      <PlayerLink
        testID={`found-profile-${player.id}`}
        name={player.name}
        style={styles.playerLink}
        onPress={() => onOpenProfile(player)}
      >
        <FriendAvatar name={player.name} size="list" />
        <Text variant="title.s" style={styles.playerName} numberOfLines={1}>
          {player.name}
        </Text>
      </PlayerLink>
      {action === "none" ? null : (
        <Button
          testID={`found-action-${player.id}`}
          label={t(LABEL_KEY[action])}
          variant={isActionable ? "primary" : "ghost"}
          isDisabled={isDisabled || !isActionable}
          onPress={() => onSend(player)}
        />
      )}
    </View>
  );
};

export default FoundPlayerRow;
