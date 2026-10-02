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
}

// TODO: the editor and play-by-code screens come with their own tasks (spec Part 4 §11)
const ignorePress = () => undefined;

const LevelsHeader = ({ stars, maxStars }: ILevelsHeader) => {
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
            label={t("levels.editor")}
            isDisabled
            onPress={ignorePress}
            icon={
              <EditorIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />
            }
          />
        </View>
        <View style={styles.button}>
          <Button
            label={t("levels.playCode")}
            isDisabled
            onPress={ignorePress}
            icon={
              <CodeIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />
            }
          />
        </View>
      </View>
    </View>
  );
};

export default LevelsHeader;
