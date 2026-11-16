import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { PlayView } from "@entities/level";
import { Text } from "@shared/ui/text";

import FlagIcon from "@assets/icons/play/flag.svg";

import { describeLastAnswer } from "../model/describe-last-answer";

import { styles } from "./answer-panel-styles";

interface IAnswerPanel {
  view: PlayView;
  isFlagMode: boolean;
  onToggleFlagMode: () => void;
}

const AnswerPanel = ({ view, isFlagMode, onToggleFlagMode }: IAnswerPanel) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  styles.useVariants({ isFlagMode });

  const { title, subtitle, tone } = describeLastAnswer(t, view);
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
