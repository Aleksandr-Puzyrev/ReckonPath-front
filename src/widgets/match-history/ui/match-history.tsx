import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MatchSummary } from "@entities/match";
import { Text } from "@shared/ui/text";

import { styles } from "./match-history-styles";
import MatchRow from "./match-row";

interface IMatchHistory {
  matches: readonly MatchSummary[];
  onOpen: (matchId: string) => void;
}

const MatchHistory = ({ matches, onOpen }: IMatchHistory) => {
  const { t } = useTranslation();

  return (
    <View style={styles.block}>
      <Text variant="eyebrow">{t("arena.history.title")}</Text>
      {matches.map((match) => (
        <MatchRow key={match.matchId} match={match} onOpen={onOpen} />
      ))}
    </View>
  );
};

export default MatchHistory;
