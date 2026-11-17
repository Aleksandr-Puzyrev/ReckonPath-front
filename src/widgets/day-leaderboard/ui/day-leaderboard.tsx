import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { DailyEntry } from "@entities/daily";
import { Text } from "@shared/ui/text";

import { styles } from "./day-leaderboard-styles";
import LeaderboardRow from "./leaderboard-row";

interface IDayLeaderboard {
  entries: readonly DailyEntry[];
  mine: DailyEntry | null;
  hasWon: boolean;
}

const TOP_BEFORE_WIN = 3;
const TOP_AFTER_WIN = 10;

// Before their own win the player sees only the top, no spoilers (до своей победы игрок видит только верх топа, без спойлеров).
const DayLeaderboard = ({ entries, mine, hasWon }: IDayLeaderboard) => {
  const { t } = useTranslation();
  const rows = entries.slice(0, hasWon ? TOP_AFTER_WIN : TOP_BEFORE_WIN);
  const isMineShown = rows.some((entry) => entry.me === true);

  return (
    <View style={styles.card}>
      <Text variant="eyebrow">{t("daily.leaderboard")}</Text>
      {rows.map((entry) => (
        <LeaderboardRow
          key={entry.id ?? entry.rank}
          rank={entry.rank ?? 0}
          name={entry.me === true ? t("daily.you") : (entry.name ?? "")}
          moves={entry.moves}
          isMine={entry.me === true}
        />
      ))}
      {mine?.rank === undefined || isMineShown ? null : (
        <LeaderboardRow rank={mine.rank} name={t("daily.you")} moves={mine.moves} isMine />
      )}
      {hasWon ? null : (
        <View style={styles.footer}>
          <Text variant="body.s" style={styles.secondary}>
            {t("daily.rankAfter")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DayLeaderboard;
