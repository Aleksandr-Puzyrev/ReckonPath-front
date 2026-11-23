import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerProfile } from "@entities/player";
import { Button } from "@shared/ui/button";

import { mainActionOf } from "../model/main-action-of";

import PlayerHint from "./player-hint";
import { styles } from "./player-profile-styles";

interface IPlayerMainAction {
  profile: PlayerProfile;
  isDisabled: boolean;
  challengeLockReason: string | null;
  onSend: () => void;
  onChallenge: () => void;
  onUnblock: () => void;
}

// A locked or banned arena keeps the challenge disabled, and a tap explains why, as in the friend row (закрытая арена или бан оставляют вызов неактивным, а нажатие объясняет причину, как в строке друга).
const PlayerMainAction = ({
  profile,
  isDisabled,
  challengeLockReason,
  onSend,
  onChallenge,
  onUnblock,
}: IPlayerMainAction) => {
  const { t } = useTranslation();
  const action = mainActionOf(profile.relation);
  const name = profile.name;

  if (action === null) return null;
  if (action === "unblock") {
    return (
      <View style={styles.action}>
        <PlayerHint text={t("block.isBlocked")} />
        <Button
          testID="player-unblock"
          label={t("block.unblock")}
          variant="secondary"
          size="l"
          isDisabled={isDisabled}
          onPress={onUnblock}
        />
      </View>
    );
  }
  if (action === "challenge") {
    return (
      <View style={styles.action}>
        <Button
          testID="player-challenge"
          label={t("player.challenge")}
          variant="primary"
          size="l"
          accessibilityHint={challengeLockReason ?? undefined}
          isDisabled={isDisabled || challengeLockReason !== null}
          onDisabledPress={isDisabled ? undefined : onChallenge}
          onPress={onChallenge}
        />
        <PlayerHint
          text={
            profile.online === true ? t("player.onlineHint", { name }) : t("player.friendlyHint")
          }
        />
      </View>
    );
  }
  if (action === "sent") {
    return (
      <View style={styles.action}>
        <Button
          testID="player-sent"
          label={t("player.requestSent")}
          variant="secondary"
          size="l"
          isDisabled
        />
        <PlayerHint text={t("player.requestHint", { name })} />
      </View>
    );
  }
  if (action === "accept") {
    return (
      <View style={styles.action}>
        <Button
          testID="player-accept"
          label={t("friends.accept")}
          variant="primary"
          size="l"
          isDisabled={isDisabled}
          onPress={onSend}
        />
      </View>
    );
  }
  return (
    <View style={styles.action}>
      <Button
        testID="player-add"
        label={t("player.addFriend")}
        variant="primary"
        size="l"
        isDisabled={isDisabled}
        onPress={onSend}
      />
    </View>
  );
};

export default PlayerMainAction;
