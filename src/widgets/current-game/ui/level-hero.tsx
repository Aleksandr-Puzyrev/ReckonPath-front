import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { GameState } from "@reckon-path/engine";

import { levelElements } from "@entities/level";
import type { CampaignLevel } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Chip } from "@shared/ui/chip";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { styles } from "./current-game-styles";

interface ILevelHero {
  campaignLevel: CampaignLevel;
  game: GameState | null;
  renderPreview: (campaignLevel: CampaignLevel, game: GameState | null) => ReactNode;
  onPlay: () => void;
}

const LevelHero = ({ campaignLevel, game, renderPreview, onPlay }: ILevelHero) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { level, number, world } = campaignLevel;

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
            {t("levels.world.sheetEyebrow", { n: world, name: t(`levels.world.name.${world}`) })}
          </Text>
        </View>
        {level.moveLimit == null ? null : (
          <Chip label={t("home.moves", { count: level.moveLimit }).toLocaleUpperCase()} />
        )}
      </View>
      <View style={styles.chips}>
        {levelElements(level).map(({ element, count }) => (
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
        {renderPreview(campaignLevel, game)}
      </Pressable>
      <View style={styles.actions}>
        {game === null ? null : (
          <Text variant="body.s" style={styles.found}>
            {t("home.found", { found: game.found.size, total: level.targets.length })}
          </Text>
        )}
        <Button
          testID="current-game-play"
          label={t(game === null ? "home.play" : "home.continue").toLocaleUpperCase()}
          variant="primary"
          size="l"
          onPress={onPlay}
        />
      </View>
    </View>
  );
};

export default LevelHero;
