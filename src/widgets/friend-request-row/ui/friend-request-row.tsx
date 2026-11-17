import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { FriendAvatar } from "@entities/friend";
import type { FriendRequest } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { formatNumber } from "@shared/lib";
import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import CloseIcon from "@assets/icons/friends/close.svg";

import { styles } from "./friend-request-row-styles";

interface IIncomingActions {
  kind: "incoming";
  onAccept: (request: FriendRequest) => void;
  onDecline: (request: FriendRequest) => void;
}

interface IOutgoingActions {
  kind: "outgoing";
  onWithdraw: (request: FriendRequest) => void;
}

type IFriendRequestRow = { request: FriendRequest; isDisabled: boolean } & (
  IIncomingActions | IOutgoingActions
);

const FriendRequestRow = (props: IFriendRequestRow) => {
  const { request, isDisabled } = props;
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const trophies = t("friends.trophies", {
    count: request.user.trophies,
    value: formatNumber(request.user.trophies, i18n.language),
  });
  const meta =
    props.kind === "incoming" ? [trophies, t("friends.wantsToBeFriends")].join(" · ") : trophies;
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <View style={styles.row} testID={`request-${request.id}`}>
      <FriendAvatar name={request.user.name} size="match" />
      <View style={styles.texts}>
        <Text variant="title.s" numberOfLines={1}>
          {request.user.name}
        </Text>
        <Text variant="body.s" style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {props.kind === "incoming" ? (
        <View style={styles.actions}>
          <IconButton
            testID={`request-decline-${request.id}`}
            accessibilityLabel={t("friends.decline")}
            isDisabled={isDisabled}
            onPress={() => props.onDecline(request)}
            icon={
              <CloseIcon width={iconSize} height={iconSize} color={theme.colors.text.secondary} />
            }
          />
          <Button
            testID={`request-accept-${request.id}`}
            label={t("friends.accept")}
            variant="primary"
            isDisabled={isDisabled}
            onPress={() => props.onAccept(request)}
          />
        </View>
      ) : (
        <Button
          testID={`request-withdraw-${request.id}`}
          label={t("friends.withdraw")}
          isDisabled={isDisabled}
          onPress={() => props.onWithdraw(request)}
        />
      )}
    </View>
  );
};

export default FriendRequestRow;
