import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useGameSessionStore } from "@entities/level";
import { Text } from "@shared/ui/text";

import FlagIcon from "@assets/icons/play/flag.svg";

import { describeLastAnswer } from "../model/describe-last-answer";

import { styles } from "./answer-panel-styles";

interface IAnswerPanel {
  isFlagMode: boolean;
  onToggleFlagMode: () => void;
}

const AnswerPanel = ({ isFlagMode, onToggleFlagMode }: IAnswerPanel) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const game = useGameSessionStore((state) => state.game);
  const lastCell = useGameSessionStore((state) => {
    const taps = state.actions.flatMap((action) => (action.type === "tap" ? [action.cell] : []));
    return taps.at(-1) ?? null;
  });
  styles.useVariants({ isFlagMode });
  if (game === null) return null;

  const { title, subtitle, tone } = describeLastAnswer(t, game, lastCell);
  const iconSize = theme.sizes.icon.l;

  return (
    <View style={styles.panel}>
      <View style={styles.texts} accessibilityLiveRegion="polite">
        <Text variant="title.l" style={styles.title(tone)} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="body.s" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        testID="flag-mode"
        accessibilityRole="switch"
        accessibilityLabel={t("play.flagMode")}
        accessibilityState={{ checked: isFlagMode }}
        onPress={onToggleFlagMode}
        style={styles.flagButton}
      >
        <FlagIcon
          width={iconSize}
          height={iconSize}
          color={isFlagMode ? theme.colors.text.onAccent : theme.colors.text.primary}
        />
      </Pressable>
    </View>
  );
};

export default AnswerPanel;
