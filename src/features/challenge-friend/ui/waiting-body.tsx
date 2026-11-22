import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useServerClock } from "@entities/app-config";
import { FriendAvatar } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TimerRing } from "@shared/ui/timer-ring";

import type { WaitingChallenge } from "../model/use-challenge-friend";

import { styles } from "./challenge-friend-styles";

interface IWaitingBody {
  waiting: WaitingChallenge;
  onCancel: () => void;
}

const TICK_MS = 250;
const SECOND_MS = 1000;

const WaitingBody = ({ waiting: { challenge, startedAt }, onCancel }: IWaitingBody) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const now = useServerClock(TICK_MS);
  const expiresAt = Date.parse(challenge.expiresAt);
  const leftMs = Math.max(0, expiresAt - now);
  const totalMs = expiresAt - startedAt;
  const { name } = challenge.to;

  return (
    <View style={styles.layer} accessibilityViewIsModal testID="challenge-waiting">
      <View style={styles.card}>
        <TimerRing
          share={totalMs > 0 ? Math.min(1, leftMs / totalMs) : 0}
          color={theme.colors.accent.cyan}
        >
          <FriendAvatar name={name} size="match" />
        </TimerRing>
        <Text variant="title.l" accessibilityRole="header" style={styles.centered}>
          {t("friends.challenge.waiting")}
        </Text>
        <Text variant="body.m" style={[styles.secondary, styles.centered]}>
          {t("friends.challenge.waitingSub", {
            name,
            size: `${challenge.format.rows}×${challenge.format.cols}`,
            sec: Math.ceil(leftMs / SECOND_MS),
          })}
        </Text>
        <Button
          testID="challenge-cancel"
          label={t("friends.challenge.cancel")}
          onPress={onCancel}
        />
      </View>
    </View>
  );
};

export default WaitingBody;
