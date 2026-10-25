import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FOG_MIN, MAX_MOVE_LIMIT, TITLE_MAX_LENGTH } from "@reckon-path/engine";

import { MIN_MOVE_LIMIT } from "@entities/custom-level";
import type { CustomParams } from "@entities/custom-level";
import { Segmented } from "@shared/ui/segmented";
import { Stepper } from "@shared/ui/stepper";
import { SwitchRow } from "@shared/ui/switch-row";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { styles } from "./level-editor-styles";

interface ILevelParams {
  title: string;
  params: CustomParams;
  moveLimit: number | null;
  norm: number | null;
  isLimitLow: boolean;
  onTitle: (title: string) => void;
  onParams: (params: Partial<CustomParams>) => void;
  onMoveLimit: (limit: number) => void;
}

const MODES: readonly CustomParams["probeMode"][] = ["distance", "direction", "hotcold"];

const LevelParams = ({
  title,
  params,
  moveLimit,
  norm,
  isLimitLow,
  onTitle,
  onParams,
  onMoveLimit,
}: ILevelParams) => {
  const { t } = useTranslation();

  return (
    <View style={styles.params}>
      <TextField
        testID="editor-title"
        label={t("editor.name")}
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChangeText={onTitle}
      />
      {moveLimit === null ? null : (
        <Stepper
          testID="editor-limit"
          label={t("editor.limit")}
          value={moveLimit}
          min={MIN_MOVE_LIMIT}
          max={MAX_MOVE_LIMIT}
          decreaseLabel={t("editor.decrease")}
          increaseLabel={t("editor.increase")}
          onChange={onMoveLimit}
        />
      )}
      {norm === null ? null : (
        <Text variant="caption" style={isLimitLow ? styles.warning : styles.secondary}>
          {isLimitLow ? t("editor.limitWarn") : t("editor.botHint", { count: norm })}
        </Text>
      )}
      <Text variant="body.s" style={styles.secondary}>
        {t("editor.new.mode")}
      </Text>
      <Segmented
        testID="editor-mode"
        options={MODES.map((value) => ({ value, label: t(`play.mode.${value}`) }))}
        value={params.probeMode}
        onChange={(probeMode) => onParams({ probeMode })}
      />
      <SwitchRow
        testID="editor-fog"
        label={t("editor.fog")}
        isOn={params.fog !== null}
        onToggle={() => onParams({ fog: params.fog === null ? FOG_MIN : null })}
      />
      <SwitchRow
        testID="editor-order"
        label={t("editor.order")}
        isOn={params.isTargetOrder}
        onToggle={() => onParams({ isTargetOrder: !params.isTargetOrder })}
      />
      <SwitchRow
        testID="editor-bomb-hint"
        label={t("editor.bombHint")}
        isOn={params.hasBombHint}
        onToggle={() => onParams({ hasBombHint: !params.hasBombHint })}
      />
    </View>
  );
};

export default LevelParams;
