import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { levelElements } from "@entities/level";
import type { CampaignLevel } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { Button } from "@shared/ui/button";
import { Chip } from "@shared/ui/chip";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./level-sheet-styles";

interface ILevelSheet {
  campaignLevel: CampaignLevel | null;
  preview: ReactNode;
  onPlay: (campaignLevel: CampaignLevel) => void;
  onDismiss: () => void;
}

const LevelSheet = ({ campaignLevel, preview, onPlay, onDismiss }: ILevelSheet) => {
  const { t, i18n } = useTranslation();
  const best = useProgressStore((state) =>
    campaignLevel === null ? undefined : state.best[campaignLevel.level.id],
  );

  if (campaignLevel === null)
    return (
      <Sheet isOpen={false} onDismiss={onDismiss}>
        {null}
      </Sheet>
    );
  const { level, number, world } = campaignLevel;
  const name = i18n.language === "ru" ? level.title?.ru : level.title?.en;
  const worldName = t(`levels.world.name.${world}`);
  const facts = [
    level.moveLimit == null ? null : t("levels.sheet.limit", { count: level.moveLimit }),
    level.stars == null ? null : t("levels.sheet.three", { count: level.stars[0] }),
    level.stars == null ? null : t("levels.sheet.two", { count: level.stars[1] }),
    best === undefined ? null : t("levels.sheet.best", { count: best.moves }),
  ].filter((fact) => fact !== null);

  return (
    <Sheet isOpen onDismiss={onDismiss}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("levels.world.sheetEyebrow", { n: world, name: worldName })}
          </Text>
          <Text variant="display.m">{t("levels.sheet.title", { n: number })}</Text>
          {name === undefined ? null : (
            <Text variant="body.s" style={styles.secondary}>
              {name}
            </Text>
          )}
        </View>
        <StarRating
          stars={best?.stars ?? 0}
          size="l"
          accessibilityLabel={t("result.stars", { count: best?.stars ?? 0 })}
        />
      </View>
      <View style={styles.body}>
        {preview}
        <View style={styles.facts}>
          {facts.map((fact) => (
            <View key={fact} style={styles.fact}>
              <Text variant="caption">{fact}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.chips}>
        {levelElements(level).map(({ element, count }) => (
          <Chip key={element} label={t(`levels.element.${element}`, { count })} />
        ))}
      </View>
      <Button
        testID="sheet-play"
        label={t("home.play")}
        variant="primary"
        size="l"
        onPress={() => onPlay(campaignLevel)}
      />
    </Sheet>
  );
};

export default LevelSheet;
