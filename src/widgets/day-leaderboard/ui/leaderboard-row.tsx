import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./leaderboard-row-styles";

interface ILeaderboardRow {
  rank: number;
  name: string;
  moves: number;
  isMine?: boolean;
}

const MEDALS = ["gold", "silver", "bronze"] as const;

const LeaderboardRow = ({ rank, name, moves, isMine = false }: ILeaderboardRow) => {
  const { t } = useTranslation();
  styles.useVariants({ medal: MEDALS[rank - 1] ?? "none", isMine });
  const value = t("daily.movesShort", { count: moves });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={t("daily.rowLabel", {
        rank,
        name,
        moves: t("daily.moves", { count: moves }),
      })}
    >
      <View style={styles.rank}>
        <Text variant="caption" style={styles.rankText}>
          {rank}
        </Text>
      </View>
      <Text variant="body.m" style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text variant="title.s">{value}</Text>
    </View>
  );
};

export default LeaderboardRow;
