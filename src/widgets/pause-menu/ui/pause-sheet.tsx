import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useSettingsStore } from "@entities/settings";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { SwitchRow } from "@shared/ui/switch-row";
import { Text } from "@shared/ui/text";

import { styles } from "./pause-sheet-styles";

interface IPauseSheet {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onRules: () => void;
  onExit: () => void;
  note?: string;
}

const PauseSheet = ({ isOpen, onResume, onRestart, onRules, onExit, note }: IPauseSheet) => {
  const { t } = useTranslation();
  const isSoundOn = useSettingsStore((state) => state.isSoundOn);
  const isMusicOn = useSettingsStore((state) => state.isMusicOn);
  const { toggleSound, toggleMusic } = useSettingsStore.getState();

  return (
    <Sheet isOpen={isOpen} onDismiss={onResume}>
      <Text variant="display.m">{t("play.pause.title")}</Text>
      {note === undefined ? null : (
        <Text variant="body.s" style={styles.note}>
          {note}
        </Text>
      )}
      <Button label={t("play.pause.resume")} onPress={onResume} variant="primary" size="l" />
      <View style={styles.row}>
        <View style={styles.cell}>
          <Button label={t("play.pause.restart")} onPress={onRestart} />
        </View>
        <View style={styles.cell}>
          <Button testID="pause-rules" label={t("play.pause.rules")} onPress={onRules} />
        </View>
      </View>
      {/* TODO: play sound and music by these toggles once the assets exist */}
      <View style={styles.switches}>
        <SwitchRow
          testID="sound"
          label={t("play.pause.sound")}
          isOn={isSoundOn}
          onToggle={toggleSound}
        />
        <SwitchRow
          testID="music"
          label={t("play.pause.music")}
          isOn={isMusicOn}
          onToggle={toggleMusic}
        />
      </View>
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
    </Sheet>
  );
};

export default PauseSheet;
