import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { LevelInput } from "@reckon-path/engine";

import { customLevelTitleOf } from "@entities/custom-level";
import { levelElements } from "@entities/level";
import { Chip } from "@shared/ui/chip";
import { Text } from "@shared/ui/text";
import { BoardPreview } from "@widgets/board";

import { styles } from "./play-code-styles";

interface ICodePreview {
  level: LevelInput;
  challenge: number | null;
}

const CodePreview = ({ level, challenge }: ICodePreview) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const title = customLevelTitleOf(level, i18n.language);
  const details = [
    t("editor.list.size", { rows: level.rows, cols: level.cols }),
    t("levels.targets", { count: level.targets.length }),
  ].join(" · ");

  return (
    <View style={styles.preview} testID="code-preview">
      <View style={styles.previewHead}>
        <BoardPreview level={level} size={theme.sizes.arena.switchMap} />
        <View style={styles.previewTexts}>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("code.play.eyebrow")}
          </Text>
          <Text variant="title.m">{title}</Text>
          <Text variant="caption" style={styles.secondary}>
            {details}
          </Text>
        </View>
      </View>
      <View style={styles.chips}>
        {levelElements(level).map(({ element, count }) => (
          <Chip key={element} label={t(`levels.element.${element}`, { count })} />
        ))}
      </View>
      {challenge === null ? null : (
        <View style={styles.challenge}>
          <Text variant="body.m">{t("code.play.challenge")}</Text>
          <Text variant="title.s">{t("code.play.challengeValue", { count: challenge })}</Text>
        </View>
      )}
    </View>
  );
};

export default CodePreview;
