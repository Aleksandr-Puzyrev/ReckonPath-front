import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerProfile } from "@entities/player";
import { formatNumber, formatPercent } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { styles } from "./player-profile-styles";

interface IPlayerStats {
  stats: PlayerProfile["stats"];
}

const PlayerStats = ({ stats }: IPlayerStats) => {
  const { t, i18n } = useTranslation();
  const tiles = [
    {
      key: "wins",
      label: t("player.wins"),
      value: `${formatNumber(stats.wins, i18n.language)} · ${formatPercent(stats.winRate, i18n.language)}`,
    },
    { key: "peak", label: t("player.peak"), value: formatNumber(stats.peak, i18n.language) },
    { key: "streak", label: t("player.streak"), value: `${stats.streak} / ${stats.bestStreak}` },
  ];

  return (
    <View style={styles.stats}>
      {tiles.map((tile) => (
        <View key={tile.key} style={styles.stat} testID={`player-stat-${tile.key}`}>
          <Text variant="caption" style={styles.secondary} numberOfLines={1}>
            {tile.label}
          </Text>
          <Text variant="title.s" numberOfLines={1} adjustsFontSizeToFit>
            {tile.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default PlayerStats;
