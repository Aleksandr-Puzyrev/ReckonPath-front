import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import StarIcon from "@assets/icons/play/star.svg";

import type { ProgressCard } from "../model/progress-card";

import { styles } from "./conflict-card-styles";

interface IConflictCard {
  kind: string;
  card: ProgressCard;
}

const ConflictCard = ({ kind, card }: IConflictCard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s;
  const stats: { key: string; label: ReactNode; value: string }[] = [
    {
      key: "level",
      label: (
        <Text variant="caption" style={styles.statLabel}>
          {t("account.conflict.level")}
        </Text>
      ),
      value: String(card.level),
    },
    {
      key: "stars",
      label: <StarIcon width={iconSize} height={iconSize} color={theme.colors.currency.coin} />,
      value: String(card.stars),
    },
    {
      key: "arena",
      label: (
        <Text variant="caption" style={styles.statLabel}>
          {t("account.conflict.arena")}
        </Text>
      ),
      value: card.league ?? t("account.conflict.noLeague"),
    },
  ];

  return (
    <View style={styles.card} accessible>
      <Text variant="eyebrow" style={styles.kind}>
        {kind}
      </Text>
      <Text variant="title.s">{card.name}</Text>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.stat}>
            {stat.label}
            <Text variant="title.s" numberOfLines={1}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ConflictCard;
