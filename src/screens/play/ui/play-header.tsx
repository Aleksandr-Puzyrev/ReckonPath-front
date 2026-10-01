import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import PauseIcon from "@assets/icons/play/pause.svg";
import RestartIcon from "@assets/icons/play/restart.svg";

import { styles } from "./play-header-styles";

interface IPlayHeader {
  levelNumber: number;
  onPause: () => void;
  onRestart: () => void;
}

const PlayHeader = ({ levelNumber, onPause, onRestart }: IPlayHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;
  const iconColor = theme.colors.text.primary;

  return (
    <View style={styles.header}>
      <IconButton
        testID="pause"
        accessibilityLabel={t("play.header.pause")}
        onPress={onPause}
        icon={<PauseIcon width={iconSize} height={iconSize} color={iconColor} />}
      />
      <Text variant="title.l" style={styles.title} accessibilityRole="header">
        {t("home.level", { n: levelNumber })}
      </Text>
      <IconButton
        testID="restart"
        accessibilityLabel={t("play.header.restart")}
        onPress={onRestart}
        icon={<RestartIcon width={iconSize} height={iconSize} color={iconColor} />}
      />
    </View>
  );
};

export default PlayHeader;
