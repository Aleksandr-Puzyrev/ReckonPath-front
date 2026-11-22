import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FriendAvatar } from "@entities/friend";
import type { Friend } from "@entities/friend";
import type { MatchFormat } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./challenge-friend-styles";

interface IChallengeSheet {
  friend: Friend | null;
  format: MatchFormat | null;
  isSending: boolean;
  onSend: () => void;
  onClose: () => void;
}

const ChallengeSheet = ({ friend, format, isSending, onSend, onClose }: IChallengeSheet) => {
  const { t } = useTranslation();
  const name = friend?.name ?? "";

  return (
    <Sheet isOpen={friend !== null} onDismiss={onClose}>
      <View style={styles.sheet}>
        <View style={styles.head}>
          <FriendAvatar name={name} size="match" />
          <View style={styles.texts}>
            <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
              {t("friends.challenge.title", { name })}
            </Text>
            <Text variant="body.s" style={styles.secondary}>
              {t("friends.challenge.friendly")}
            </Text>
          </View>
        </View>
        {format === null ? null : (
          <Text variant="body.m" testID="challenge-format">
            {t("arena.format", {
              size: `${format.rows}×${format.cols}`,
              count: format.targets,
              sec: format.moveSeconds,
            })}
          </Text>
        )}
        <Button
          testID="challenge-send"
          label={t("friends.challenge.send")}
          variant="primary"
          size="l"
          isDisabled={isSending}
          onPress={onSend}
        />
      </View>
    </Sheet>
  );
};

export default ChallengeSheet;
