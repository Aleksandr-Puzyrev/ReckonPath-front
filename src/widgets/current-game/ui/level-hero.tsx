import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { publicBoardElements } from "@entities/level";
import type { CampaignLevel, CampaignWorld, PublicBoard } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Chip } from "@shared/ui/chip";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { styles } from "./current-game-styles";

interface ActiveGame {
  found: number;
  total: number;
}

interface ILevelHero {
  level: CampaignLevel;
  world: CampaignWorld;
  board: PublicBoard | null;
  active: ActiveGame | null;
  renderPreview: (board: PublicBoard, levelNumber: number) => ReactNode;
  onPlay: () => void;
}

const NO_LIMIT = 0;

const LevelHero = ({ level, world, board, active, renderPreview, onPlay }: ILevelHero) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { number } = level;

  return (
    <View style={styles.hero} testID="current-game">
      <Gradient name="heroHome" radius={theme.radius.xl} />
      <View style={styles.head}>
        <View style={styles.texts}>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("home.eyebrow")}
          </Text>
          <Text variant="display.l" style={styles.title} accessibilityRole="header">
            {t("home.level", { n: number })}
          </Text>
          <Text variant="body.s" style={styles.subtitle}>
            {t("levels.world.sheetEyebrow", { n: world.number, name: world.title })}
          </Text>
        </View>
        {board === null || board.limit === NO_LIMIT ? null : (
          <Chip label={t("home.moves", { count: board.limit }).toLocaleUpperCase()} />
        )}
      </View>
      <View style={styles.chips}>
        {(board === null ? [] : publicBoardElements(board)).map(({ element, count }) => (
          <Chip key={element} label={t(`levels.element.${element}`, { count })} />
        ))}
      </View>
      <Pressable
        testID="current-game-preview"
        accessibilityRole="button"
        accessibilityLabel={t("home.preview", { n: number })}
        onPress={onPlay}
        style={styles.preview}
      >
        {board === null ? null : renderPreview(board, number)}
      </Pressable>
      <View style={styles.actions}>
        {active === null ? null : (
          <Text variant="body.s" style={styles.found}>
            {t("home.found", { found: active.found, total: active.total })}
          </Text>
        )}
        <Button
          testID="current-game-play"
          label={t(active === null ? "home.play" : "home.continue").toLocaleUpperCase()}
          variant="primary"
          size="l"
          onPress={onPlay}
        />
      </View>
    </View>
  );
};

export default LevelHero;
