import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { DailyRewardChips } from "@entities/daily";
import type { DailyGameResult, DayPlace } from "@entities/daily";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import FlameIcon from "@assets/icons/daily/flame.svg";

import { styles } from "./daily-result-sheet-styles";

interface IDailyResultSheet {
  isOpen: boolean;
  result: DailyGameResult;
  limit: number | null;
  place: DayPlace | null;
  onHome: () => void;
}

// Only a win reaches this sheet and the day cannot be played again (сюда попадает только победа, и день больше не сыграть).
const DailyResultSheet = ({ isOpen, result, limit, place, onHome }: IDailyResultSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.xl;

  return (
    <Sheet isOpen={isOpen} onDismiss={onHome} isDismissible={false}>
      <View style={styles.header}>
        <View>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("daily.result.eyebrow")}
          </Text>
          <Text variant="display.m">{t("daily.result.title")}</Text>
        </View>
        <StarRating
          stars={result.stars}
          accessibilityLabel={t("result.stars", { count: result.stars })}
        />
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="eyebrow" style={styles.label}>
            {t("daily.result.moves")}
          </Text>
          <Text variant="title.m">
            {limit === null
              ? result.moves
              : t("daily.result.movesOf", { used: result.moves, limit })}
          </Text>
        </View>
      </View>
      {place === null ? (
        <Text variant="body.s" style={styles.muted}>
          {t("daily.result.counting")}
        </Text>
      ) : (
        <Text variant="title.m" style={styles.place}>
          {t("daily.place", { rank: place.rank, total: place.total })}
        </Text>
      )}
      {result.streak === undefined ? null : (
        <View style={styles.streak}>
          <FlameIcon width={iconSize} height={iconSize} color={theme.colors.feedback.warm} />
          <Text variant="title.s">{t("daily.result.streakToday", { count: result.streak })}</Text>
        </View>
      )}
      <DailyRewardChips coins={result.coins} gems={result.streakGems ?? 0} xp={result.xp} />
      <Button label={t("daily.result.home")} onPress={onHome} size="l" />
    </Sheet>
  );
};

export default DailyResultSheet;
