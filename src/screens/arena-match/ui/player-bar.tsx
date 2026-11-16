import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";
import { TimerRing } from "@shared/ui/timer-ring";

import { styles } from "./arena-match-styles";

interface IPlayerBar {
  side: "me" | "opponent";
  nickname: string;
  status: string;
  timerShare: number;
  isWarning: boolean;
}

const PlayerBar = ({ side, nickname, status, timerShare, isWarning }: IPlayerBar) => {
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
        </View>
        <Text variant="caption" style={styles.secondary}>
          {status}
        </Text>
      </View>
    </View>
  );
};

export default PlayerBar;
