import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./leaderboard-row-styles";

interface ILeaderboardRow {
  rank: number | null;
  name: string;
  moves: number;
  isMine?: boolean;
}

const MEDALS = ["gold", "silver", "bronze"] as const;

const LeaderboardRow = ({ rank, name, moves, isMine = false }: ILeaderboardRow) => {
  const { t } = useTranslation();
  styles.useVariants({ medal: rank === null ? "none" : (MEDALS[rank - 1] ?? "none"), isMine });
  const value = t("daily.movesShort", { count: moves });
  const movesText = t("daily.moves", { count: moves });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={
        rank === null
          ? `${name}, ${movesText}`
          : t("daily.rowLabel", { rank, name, moves: movesText })
      }
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
