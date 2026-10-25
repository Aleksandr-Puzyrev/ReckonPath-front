import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { MAX_BOARD_SIZE, MIN_BOARD_SIZE } from "@reckon-path/engine";

import { NEW_LEVEL_SIZE } from "@entities/custom-level";
import type { CustomParams } from "@entities/custom-level";
import { Button } from "@shared/ui/button";
import { Segmented } from "@shared/ui/segmented";
import { Sheet } from "@shared/ui/sheet";
import { Stepper } from "@shared/ui/stepper";
import { Text } from "@shared/ui/text";
import { BoardPreview } from "@widgets/board";

import { styles } from "./my-levels-styles";

type ProbeMode = CustomParams["probeMode"];

interface INewLevelSheet {
  isOpen: boolean;
  onCreate: (rows: number, cols: number, probeMode: ProbeMode) => void;
  onClose: () => void;
}

const MODES: readonly ProbeMode[] = ["distance", "direction", "hotcold"];

const NewLevelSheet = ({ isOpen, onCreate, onClose }: INewLevelSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [rows, setRows] = useState(NEW_LEVEL_SIZE);
  const [cols, setCols] = useState(NEW_LEVEL_SIZE);
  const [mode, setMode] = useState<ProbeMode>("distance");
  const stepperLabels = {
    decreaseLabel: t("editor.decrease"),
    increaseLabel: t("editor.increase"),
  };

  return (
    <Sheet isOpen={isOpen} onDismiss={onClose}>
      <View style={styles.sheet}>
        <Text variant="title.m" accessibilityRole="header">
          {t("editor.new.title")}
        </Text>
        <View style={styles.preview}>
          <BoardPreview
            level={{ v: 2, id: "u-new", rows, cols, targets: [[0, 0]], probeMode: mode }}
            size={theme.sizes.arena.myMap}
          />
        </View>
        <Stepper
          testID="new-rows"
          label={t("editor.new.rows")}
          value={rows}
          min={MIN_BOARD_SIZE}
          max={MAX_BOARD_SIZE}
          onChange={setRows}
          {...stepperLabels}
        />
        <Stepper
          testID="new-cols"
          label={t("editor.new.cols")}
          value={cols}
          min={MIN_BOARD_SIZE}
          max={MAX_BOARD_SIZE}
          onChange={setCols}
          {...stepperLabels}
        />
        <Text variant="body.s" style={styles.secondary}>
          {t("editor.new.mode")}
        </Text>
        <Segmented
          testID="new-mode"
          options={MODES.map((value) => ({ value, label: t(`play.mode.${value}`) }))}
          value={mode}
          onChange={setMode}
        />
        <Button
          testID="new-create"
          label={t("editor.new.create").toLocaleUpperCase()}
          variant="primary"
          size="l"
          onPress={() => onCreate(rows, cols, mode)}
        />
      </View>
    </Sheet>
  );
};

export default NewLevelSheet;
