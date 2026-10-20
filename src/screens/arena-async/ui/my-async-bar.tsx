import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTurnCountdown } from "@entities/match";
import { useMeQuery } from "@entities/wallet";
import { Text } from "@shared/ui/text";
import { TimerRing } from "@shared/ui/timer-ring";

import { styles } from "./arena-async-styles";

interface IMyAsyncBar {
  deadline: number | null;
  turnSec: number;
  status: string;
}

const MS_PER_SECOND = 1000;
// The server deadline adds 300 ms for the network to the turn time (Part 7 §8.4) (серверный дедлайн добавляет к ходу 300 мс на сеть).
const NETWORK_ALLOWANCE_MS = 300;
const TIMER_WARN_MS = 2000;

// The countdown lives here, so its ticks redraw the bar and not the board (отсчёт живёт здесь, поэтому его тики перерисовывают полосу, а не поле).
const MyAsyncBar = ({ deadline, turnSec, status }: IMyAsyncBar) => {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const left = useTurnCountdown(deadline);
  const turnMs = turnSec * MS_PER_SECOND + NETWORK_ALLOWANCE_MS;
  const isWarning = left > 0 && left <= TIMER_WARN_MS;
  const nickname = me?.nickname ?? "";

  return (
    <View style={styles.bar}>
      <TimerRing
        share={turnMs > 0 ? left / turnMs : 0}
        color={isWarning ? theme.colors.status.danger : theme.colors.player.me}
      >
        <View style={[styles.avatar, styles.myAvatar]}>
          <Text variant="title.m" style={styles.avatarLetter}>
            {nickname.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      </TimerRing>
      <View style={styles.flex}>
        <Text variant="title.s">{nickname}</Text>
        <Text variant="caption" style={styles.secondary}>
          {status}
        </Text>
      </View>
      <Text variant="caption" style={styles.secondary} accessibilityLiveRegion="polite">
        {t("match.yourTurn")}
      </Text>
    </View>
  );
};

export default MyAsyncBar;
