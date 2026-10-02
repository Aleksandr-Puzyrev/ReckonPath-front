import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { LevelInput } from "@reckon-path/engine";

import type { DailyRecord } from "@entities/daily";
import { describeLevelElements, describeLevelShape } from "@entities/level";
import { Button } from "@shared/ui/button";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-today-card-styles";

interface IDailyTodayCard {
  level: LevelInput;
  preview: ReactNode;
  record: DailyRecord | undefined;
  hasSavedGame: boolean;
  onPlay: () => void;
}

const DailyTodayCard = ({ level, preview, record, hasSavedGame, onPlay }: IDailyTodayCard) => {
  const { t } = useTranslation();
  const elements = describeLevelElements(t, level);
  const limit = level.moveLimit ?? null;
  const threeStarMoves = level.stars?.[0] ?? null;

  const playedText = () => {
    if (record === undefined) return "";
    const moves = t("daily.moves", { count: record.movesUsed });
    return record.rank === null
      ? t("daily.doneNoRank", { moves })
      : t("daily.done", { moves, rank: record.rank });
  };

  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        {preview}
        <View style={styles.details}>
          <Text variant="eyebrow" style={styles.secondary}>
            {t("daily.today")}
          </Text>
          <Text variant="title.s">{describeLevelShape(t, level)}</Text>
          {elements === "" ? null : (
            <Text variant="body.s" style={styles.secondary}>
              {elements}
            </Text>
          )}
          {limit === null || threeStarMoves === null ? null : (
            <Text variant="body.s" style={styles.secondary}>
              {t("daily.limit", { count: limit, moves: threeStarMoves })}
            </Text>
          )}
        </View>
      </View>
      {record === undefined ? null : (
        <View style={styles.played}>
          <View style={styles.playedText}>
            <Text variant="title.s">{playedText()}</Text>
            {record.stars === null ? null : <StarRating stars={record.stars} />}
          </View>
        </View>
      )}
      {record === undefined || hasSavedGame ? (
        <Button
          testID="daily-play"
          label={hasSavedGame ? t("home.continue") : t("home.play")}
          onPress={onPlay}
          variant="primary"
          size="l"
        />
      ) : (
        <Button testID="daily-replay" label={t("daily.replay")} onPress={onPlay} size="l" />
      )}
    </View>
  );
};

export default DailyTodayCard;
