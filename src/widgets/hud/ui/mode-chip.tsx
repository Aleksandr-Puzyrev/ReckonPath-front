import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { ProbeMode } from "@reckon-path/engine";

import { Text } from "@shared/ui/text";

import InfoIcon from "@assets/icons/play/info.svg";

import { styles } from "./mode-chip-styles";

interface IModeChip {
  mode: ProbeMode;
  fog: number | null;
  onInfo: () => void;
}

const ModeChip = ({ mode, fog, onInfo }: IModeChip) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const label =
    fog === null ? t(`play.mode.${mode}`) : t("play.mode.fog", { mode: t(`play.mode.${mode}`) });
  const iconSize = theme.sizes.icon.s;

  return (
    <Pressable
      testID="mode-info"
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${t("rules.info")}`}
      onPress={onInfo}
      hitSlop={(theme.sizes.touchTarget - theme.space[8]) / 2}
      style={styles.chip}
    >
      <Text variant="caption" style={styles.text}>
        {label}
      </Text>
      <InfoIcon width={iconSize} height={iconSize} color={theme.colors.accent.cyan} />
    </Pressable>
  );
};

export default ModeChip;
