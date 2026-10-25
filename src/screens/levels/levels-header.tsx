import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { ScreenTitle } from "@shared/ui/screen-title";
import { Text } from "@shared/ui/text";

import CodeIcon from "@assets/icons/levels/code.svg";
import EditorIcon from "@assets/icons/levels/editor.svg";
import StarIcon from "@assets/icons/play/star.svg";

import { styles } from "./levels-header-styles";

interface ILevelsHeader {
  stars: number;
  maxStars: number;
  onEditor: () => void;
  onPlayCode: () => void;
}

const LevelsHeader = ({ stars, maxStars, onEditor, onPlayCode }: ILevelsHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s;

  return (
    <View style={styles.header}>
      <ScreenTitle
        eyebrow={t("levels.eyebrow")}
        title={t("levels.title")}
        right={
          <View style={styles.starsChip} accessible accessibilityLabel={`${stars} / ${maxStars}`}>
            <StarIcon width={iconSize} height={iconSize} color={theme.colors.currency.coin} />
            <Text variant="number.counter">{`${stars} / ${maxStars}`}</Text>
          </View>
        }
      />
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button
            testID="levels-editor"
            label={t("levels.editor")}
            onPress={onEditor}
            icon={
              <EditorIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
            }
          />
        </View>
        <View style={styles.button}>
          <Button
            testID="levels-play-code"
            label={t("levels.playCode")}
            onPress={onPlayCode}
            icon={<CodeIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />}
          />
        </View>
      </View>
    </View>
  );
};

export default LevelsHeader;
