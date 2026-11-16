import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { HistoryItem } from "@entities/match";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { formatTrophyDelta } from "../model/format-trophy-delta";
import { matchLineOf } from "../model/match-line-of";

import { styles } from "./match-history-styles";

interface IMatchRow {
  match: HistoryItem;
  onOpen: (matchId: string) => void;
}

const toneOf = (delta: number) => {
  if (delta > 0) return "gain";
  return delta < 0 ? "loss" : "even";
};

const MatchRow = ({ match, onOpen }: IMatchRow) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const line = matchLineOf(match, t);
  const delta = formatTrophyDelta(match.trophies);
  styles.useVariants({ tone: toneOf(match.trophies) });

  return (
    <Pressable
      testID={`match-row-${match.matchId}`}
      accessibilityRole="button"
      accessibilityLabel={`${match.rival.name}, ${line}, ${delta}`}
      onPress={() => onOpen(match.matchId)}
      style={styles.row}
    >
      <View style={styles.avatar}>
        <Gradient name="primary" radius={theme.radius.m} />
        <Text variant="title.s" style={styles.initial}>
          {match.rival.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.texts}>
        <View style={styles.name}>
          <Text variant="title.s" numberOfLines={1}>
            {match.rival.name}
          </Text>
          {match.rival.bot === true || match.kind === "bot" ? (
            <View style={styles.badge}>
              <Text variant="caption" style={styles.secondary}>
                {t("arena.history.bot")}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="body.s" style={styles.secondary} numberOfLines={1}>
          {line}
        </Text>
      </View>
      <Text variant="number.counter" style={styles.delta}>
        {delta}
      </Text>
    </Pressable>
  );
};

export default MatchRow;
