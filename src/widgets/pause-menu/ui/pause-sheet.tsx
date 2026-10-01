import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./pause-sheet-styles";

interface IPauseSheet {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

const PauseSheet = ({ isOpen, onResume, onRestart, onExit }: IPauseSheet) => {
  const { t } = useTranslation();

  return (
    <Sheet isOpen={isOpen} onDismiss={onResume}>
      <Text variant="display.m">{t("play.pause.title")}</Text>
      <Button label={t("play.pause.resume")} onPress={onResume} variant="primary" size="l" />
      <View style={styles.row}>
        <View style={styles.cell}>
          <Button label={t("play.pause.restart")} onPress={onRestart} />
        </View>
        <View style={styles.cell}>
          {/* TODO: open the rule cards of elements seen so far (stage 1, task 4) */}
          <Button label={t("play.pause.rules")} onPress={onResume} isDisabled />
        </View>
      </View>
      {/* TODO: sound and music toggles come with the audio and settings tasks */}
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
    </Sheet>
  );
};

export default PauseSheet;
