import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PlayerLink } from "@entities/player";
import { RankBadge } from "@shared/ui/rank-badge";
import { Text } from "@shared/ui/text";

import { styles } from "./leaderboard-row-styles";

interface ILeaderboardRow {
  rank: number | null;
  name: string;
  moves: number;
  isMine?: boolean;
  onPress?: () => void;
  testID?: string;
}

const LeaderboardRow = ({
  rank,
  name,
  moves,
  isMine = false,
  onPress,
  testID,
}: ILeaderboardRow) => {
  const { t } = useTranslation();
  styles.useVariants({ isMine });
  const movesText = t("daily.moves", { count: moves });
  const content = (
    <>
      <RankBadge rank={rank} />
      <Text variant="body.m" style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text variant="title.s">{t("daily.movesShort", { count: moves })}</Text>
    </>
  );

  if (onPress !== undefined) {
    return (
      <PlayerLink testID={testID} name={name} style={styles.row} onPress={onPress}>
        {content}
      </PlayerLink>
    );
  }
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
      {content}
    </View>
  );
};

export default LeaderboardRow;
