import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import ArrowDownIcon from "@assets/icons/levels/arrow-down.svg";
import ArrowUpIcon from "@assets/icons/levels/arrow-up.svg";

import type { JumpDirection } from "../model/jump-direction";

import { styles } from "./to-current-button-styles";

interface IToCurrentButton {
  direction: JumpDirection;
  onPress: () => void;
}

const ToCurrentButton = ({ direction, onPress }: IToCurrentButton) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const Icon = direction === "down" ? ArrowDownIcon : ArrowUpIcon;
  const iconSize = theme.sizes.icon.s;

  return (
    <Animated.View
      style={styles.anchor}
      entering={FadeInDown.duration(theme.motion.duration.base)}
      exiting={FadeOut.duration(theme.motion.duration.fast)}
    >
      <Pressable
        testID="to-current"
        accessibilityRole="button"
        accessibilityLabel={t("levels.toCurrent")}
        onPress={onPress}
        style={styles.button}
      >
        <Icon width={iconSize} height={iconSize} color={theme.colors.text.inverse} />
        <Text variant="button.s" style={styles.text}>
          {t("levels.toCurrent")}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default ToCurrentButton;
