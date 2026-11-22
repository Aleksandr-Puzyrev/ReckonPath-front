import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { FRIEND_STATUS_TEXT_KEY, FriendAvatar, friendStatusOf } from "@entities/friend";
import type { Friend } from "@entities/friend";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import MoreIcon from "@assets/icons/friends/more.svg";

import { styles } from "./friend-row-styles";

interface IFriendRow {
  friend: Friend;
  isDisabled: boolean;
  challengeLockReason: string | null;
  onChallenge: (friend: Friend) => void;
  onMore: (friend: Friend) => void;
}

// A locked or banned arena keeps «Вызвать» disabled, and a tap explains why (decision 0062 #22) (закрытая арена или бан оставляют «Вызвать» неактивной, а нажатие объясняет причину).
const FriendRow = ({
  friend,
  isDisabled,
  challengeLockReason,
  onChallenge,
  onMore,
}: IFriendRow) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const status = friendStatusOf(friend);
  const meta = [
    t("friends.trophies", {
      count: friend.trophies,
      value: formatNumber(friend.trophies, i18n.language),
    }),
    t(FRIEND_STATUS_TEXT_KEY[status]),
  ].join(" · ");
  const iconSize = theme.sizes.iconButton.icon;
  const isChallengeDisabled = isDisabled || status === "in_match";

  return (
    <View style={styles.row} testID={`friend-${friend.id}`}>
      <FriendAvatar name={friend.name} size="match" status={status} />
      <View style={styles.texts}>
        <Text variant="title.s" numberOfLines={1}>
          {friend.name}
        </Text>
        <Text variant="body.s" style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <Button
        testID={`friend-challenge-${friend.id}`}
        label={t("friends.challenge.action")}
        accessibilityLabel={`${t("friends.challenge.action")}, ${friend.name}`}
        variant="primary"
        size="s"
        accessibilityHint={challengeLockReason ?? undefined}
        isDisabled={isChallengeDisabled || challengeLockReason !== null}
        onDisabledPress={isChallengeDisabled ? undefined : () => onChallenge(friend)}
        onPress={() => onChallenge(friend)}
      />
      <IconButton
        testID={`friend-more-${friend.id}`}
        accessibilityLabel={`${t("friends.remove")}, ${friend.name}`}
        isDisabled={isDisabled}
        onPress={() => onMore(friend)}
        icon={<MoreIcon width={iconSize} height={iconSize} color={theme.colors.text.secondary} />}
      />
    </View>
  );
};

export default FriendRow;
