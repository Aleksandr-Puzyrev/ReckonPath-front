import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ProbeMode } from "@reckon-path/engine";

import { Text } from "@shared/ui/text";

import { styles } from "./mode-chip-styles";

interface IModeChip {
  mode: ProbeMode;
  fog: number | null;
}

// TODO: the ⓘ button opens the rule card of the mode (stage 1, task 4)
const ModeChip = ({ mode, fog }: IModeChip) => {
  const { t } = useTranslation();
  const label = t(`play.mode.${mode}`);

  return (
    <View style={styles.chip}>
      <Text variant="caption" style={styles.text}>
        {fog === null ? label : t("play.mode.fog", { mode: label })}
      </Text>
    </View>
  );
};

export default ModeChip;
