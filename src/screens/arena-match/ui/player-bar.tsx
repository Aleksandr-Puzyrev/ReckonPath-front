import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import WifiOffIcon from "@assets/icons/arena/wifi-off.svg";

import { styles } from "./arena-match-styles";
import TimerRing from "./timer-ring";

interface IPlayerBar {
  side: "me" | "opponent";
  nickname: string;
  status: string;
  timerShare: number;
  isWarning: boolean;
  isOffline: boolean;
  bubble: string | null;
}

const PlayerBar = ({
  side,
  nickname,
  status,
  timerShare,
  isWarning,
  isOffline,
  bubble,
}: IPlayerBar) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const color = isWarning ? theme.colors.status.danger : theme.colors.player[side];
  styles.useVariants({ side });

  return (
    <View style={styles.bar} testID={`bar-${side}`}>
      <TimerRing share={timerShare} color={color}>
        <View style={styles.avatar}>
          <Text variant="title.m" style={styles.avatarLetter}>
            {nickname.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      </TimerRing>
      <View style={styles.barTexts}>
        <View style={styles.barName}>
          <Text variant="title.s" numberOfLines={1}>
            {nickname}
          </Text>
          {isOffline ? (
            <WifiOffIcon
              accessibilityLabel={t("match.oppReconnecting")}
              width={theme.sizes.icon.s}
              height={theme.sizes.icon.s}
              color={theme.colors.status.warning}
            />
          ) : null}
        </View>
        <Text variant="caption" style={styles.secondary}>
          {status}
        </Text>
      </View>
      {bubble === null ? null : (
        <View style={styles.bubble} testID={`bubble-${side}`}>
          <Text variant="button.s">{bubble}</Text>
        </View>
      )}
    </View>
  );
};

export default PlayerBar;
