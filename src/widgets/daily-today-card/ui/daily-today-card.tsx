import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { DailyRewardChips, dayResultOf } from "@entities/daily";
import type { DailyDay, DailyRewards } from "@entities/daily";
import { Button } from "@shared/ui/button";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-today-card-styles";

interface IDailyTodayCard {
  day: DailyDay;
  rewards: DailyRewards;
  onPlay: () => void;
}

const MAX_STARS = 3;

// The server sends no board before the start, so the card shows what it knows: the title, the size and the rewards (сервер не присылает поле до старта, поэтому карточка показывает то, что известно: название, размер и награды).
const DailyTodayCard = ({ day, rewards, onPlay }: IDailyTodayCard) => {
  const { t } = useTranslation();
  const result = dayResultOf(day);
  const [rows, cols] = day.size ?? [];

  return (
    <View style={styles.card}>
      <View style={styles.details}>
        <Text variant="eyebrow" style={styles.secondary}>
          {t("daily.today")}
        </Text>
        {day.title === undefined || day.title === "" ? null : (
          <Text variant="title.s">{day.title}</Text>
        )}
        {rows === undefined || cols === undefined ? null : (
          <Text variant="body.s" style={styles.secondary}>
            {t("levels.size", { rows, cols })}
          </Text>
        )}
      </View>
      {result === null ? (
        <DailyRewardChips
          coins={rewards.coins + rewards.coinsPerStar * MAX_STARS}
          gems={0}
          xp={rewards.xp}
        />
      ) : (
        <View style={styles.played} testID="daily-won">
          <View style={styles.playedText}>
            <Text variant="title.s">
              {t("daily.doneNoRank", { moves: t("daily.moves", { count: result.moves }) })}
            </Text>
            {result.place === null ? null : (
              <Text variant="body.s" style={styles.secondary}>
                {t("daily.place", { rank: result.place.rank, total: result.place.total })}
              </Text>
            )}
          </View>
          <StarRating
            stars={result.stars}
            accessibilityLabel={t("result.stars", { count: result.stars })}
          />
        </View>
      )}
      {result === null ? (
        <Button
          testID="daily-play"
          label={day.status === "play" ? t("home.continue") : t("home.play")}
          onPress={onPlay}
          variant="primary"
          size="l"
        />
      ) : null}
    </View>
  );
};

export default DailyTodayCard;
