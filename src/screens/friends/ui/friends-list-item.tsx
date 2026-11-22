import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Friend, FriendRequest } from "@entities/friend";
import { Text } from "@shared/ui/text";
import { FriendRequestRow } from "@widgets/friend-request-row";
import { FriendRow } from "@widgets/friend-row";

import type { FriendsRow } from "../model/friends-rows";

import { styles } from "./friends-screen-styles";

interface IFriendsListItem {
  row: FriendsRow;
  isDisabled: boolean;
  challengeLockReason: string | null;
  removingId: string | null;
  onChallenge: (friend: Friend) => void;
  onMore: (friend: Friend) => void;
  onAccept: (request: FriendRequest) => void;
  onDecline: (request: FriendRequest) => void;
  onWithdraw: (request: FriendRequest) => void;
}

const FriendsListItem = ({
  row,
  isDisabled,
  challengeLockReason,
  removingId,
  ...handlers
}: IFriendsListItem) => {
  const { t } = useTranslation();

  if (row.kind === "outgoingTitle") {
    return (
      <Text variant="eyebrow" style={styles.sectionTitle}>
        {t("friends.outgoing")}
      </Text>
    );
  }
  if (row.kind === "friend") {
    return (
      <View style={styles.item}>
        <FriendRow
          friend={row.friend}
          isDisabled={isDisabled || removingId === row.friend.id}
          challengeLockReason={challengeLockReason}
          onChallenge={handlers.onChallenge}
          onMore={handlers.onMore}
        />
      </View>
    );
  }
  if (row.kind === "incoming") {
    return (
      <View style={styles.item}>
        <FriendRequestRow
          kind="incoming"
          request={row.request}
          isDisabled={isDisabled}
          onAccept={handlers.onAccept}
          onDecline={handlers.onDecline}
        />
      </View>
    );
  }
  return (
    <View style={styles.item}>
      <FriendRequestRow
        kind="outgoing"
        request={row.request}
        isDisabled={isDisabled}
        onWithdraw={handlers.onWithdraw}
      />
    </View>
  );
};

export default FriendsListItem;
