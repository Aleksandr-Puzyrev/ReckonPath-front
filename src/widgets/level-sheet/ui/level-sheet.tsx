import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { publicBoardElements } from "@entities/level";
import type { CampaignLevel, CampaignWorld, PublicBoard } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Chip } from "@shared/ui/chip";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./level-sheet-styles";

interface ISheetLevel {
  level: CampaignLevel;
  world: CampaignWorld;
}

interface ILevelSheet {
  sheet: ISheetLevel | null;
  board: PublicBoard | null;
  preview: ReactNode;
  onPlay: (level: CampaignLevel) => void;
  onDismiss: () => void;
}

const NO_LIMIT = 0;

const LevelSheet = ({ sheet, board, preview, onPlay, onDismiss }: ILevelSheet) => {
  const { t } = useTranslation();

  if (sheet === null)
    return (
      <Sheet isOpen={false} onDismiss={onDismiss}>
        {null}
      </Sheet>
    );
  const { level, world } = sheet;
  const hasLimit = board !== null && board.limit !== NO_LIMIT;
  const [three, two] = board?.stars ?? [];
  const facts = [
    hasLimit ? t("levels.sheet.limit", { count: board.limit }) : null,
    hasLimit && three !== undefined ? t("levels.sheet.three", { count: three }) : null,
    hasLimit && two !== undefined ? t("levels.sheet.two", { count: two }) : null,
    level.bestMoves === undefined ? null : t("levels.sheet.best", { count: level.bestMoves }),
  ].filter((fact) => fact !== null);

  return (
    <Sheet isOpen onDismiss={onDismiss}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("levels.world.sheetEyebrow", { n: world.number, name: world.title })}
          </Text>
          <Text variant="display.m">{t("levels.sheet.title", { n: level.number })}</Text>
          {level.title === "" ? null : (
            <Text variant="body.s" style={styles.secondary}>
              {level.title}
            </Text>
          )}
        </View>
        <StarRating
          stars={level.stars}
          size="l"
          accessibilityLabel={t("result.stars", { count: level.stars })}
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
        {(board === null ? [] : publicBoardElements(board)).map(({ element, count }) => (
          <Chip key={element} label={t(`levels.element.${element}`, { count })} />
        ))}
      </View>
      <Button
        testID="sheet-play"
        label={t("home.play")}
        variant="primary"
        size="l"
        onPress={() => onPlay(level)}
      />
    </Sheet>
  );
};

export default LevelSheet;
