import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { components } from "@shared/api";
import { Text } from "@shared/ui/text";

import { styles } from "./day-leaderboard-styles";
import LeaderboardRow from "./leaderboard-row";

type LeaderboardRowData = components["schemas"]["LeaderboardRow"];

interface MyPlace {
  rank: number;
  moves: number;
}

interface IDayLeaderboard {
  top: readonly LeaderboardRowData[] | null;
  median: number | null;
  myPlace: MyPlace | null;
  hasPlayed: boolean;
}

const TOP_BEFORE_ATTEMPT = 3;
const TOP_AFTER_ATTEMPT = 10;

// Before their own attempt the player sees only the top and the median, no spoilers (до своей попытки игрок видит только топ и медиану, без спойлеров).
const DayLeaderboard = ({ top, median, myPlace, hasPlayed }: IDayLeaderboard) => {
  const { t } = useTranslation();
  const rows = top?.slice(0, hasPlayed ? TOP_AFTER_ATTEMPT : TOP_BEFORE_ATTEMPT) ?? [];

  return (
    <View style={styles.card}>
      <Text variant="eyebrow">{t("daily.leaderboard")}</Text>
      {top === null ? (
        <Text variant="body.s" style={styles.secondary}>
          {t("daily.offline")}
        </Text>
      ) : null}
      {rows.map((row) => (
        <LeaderboardRow
          key={row.user.id}
          rank={row.rank}
          name={row.user.nickname}
          moves={row.value}
        />
      ))}
      {myPlace === null ? null : (
        <LeaderboardRow rank={myPlace.rank} name={t("daily.you")} moves={myPlace.moves} isMine />
      )}
      {hasPlayed || median === null ? null : (
        <View style={styles.footer}>
          <Text variant="body.s" style={styles.secondary}>
            {t("daily.rankAfter")}
          </Text>
          <Text variant="title.s">{t("daily.median", { count: median })}</Text>
        </View>
      )}
    </View>
  );
};

export default DayLeaderboard;
