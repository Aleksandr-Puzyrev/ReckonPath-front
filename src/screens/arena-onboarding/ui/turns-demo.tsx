import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { TimerRing } from "@shared/ui/timer-ring";

import { styles } from "./arena-onboarding-styles";

const FULL_TIME = 1;
const HALF_TIME = 0.5;

const TurnsDemo = () => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.players}>
      <TimerRing share={FULL_TIME} color={theme.colors.player.me}>
        <View style={[styles.avatar, styles.avatarMe]} />
      </TimerRing>
      <TimerRing share={HALF_TIME} color={theme.colors.player.opponent}>
        <View style={[styles.avatar, styles.avatarOpponent]} />
      </TimerRing>
    </View>
  );
};

export default TurnsDemo;
