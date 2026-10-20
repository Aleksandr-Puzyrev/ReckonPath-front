import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfMap } from "@entities/arena-map";
import type { MatchDetails } from "@entities/match";
import { formatDateTime } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { BoardMapPreview } from "@widgets/board";
import { formatTrophyDelta } from "@widgets/match-history";

import { tapsOnMap } from "../model/taps-on-map";

import { styles } from "./match-details-styles";

const RESULT_KEYS = {
  win: "result.pvp.win",
  loss: "result.pvp.lose",
  draw: "result.pvp.draw",
  annulled: "arena.history.annulled",
} as const;

interface IMatchDetailsBody {
  match: MatchDetails;
}

const MatchDetailsBody = ({ match }: IMatchDetailsBody) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { opponent, maps, taps } = match;
  const name = opponent.nickname;
  const size = theme.sizes.arena.detailsMap;

  return (
    <>
      <Text variant="title.l" accessibilityRole="header">
        {t("arena.details.title", { name })}
      </Text>
      <Text variant="title.s">
        {`${t(RESULT_KEYS[match.result])} · ${formatTrophyDelta(match.trophiesDelta)}`}
      </Text>
      <Text variant="body.s" style={styles.secondary}>
        {t("arena.details.meta", {
          date: formatDateTime(match.endedAt, i18n.language),
          size: `${maps.mine.rows}×${maps.mine.cols}`,
        })}
      </Text>
      <Text variant="display.m" style={styles.score}>
        {t("arena.details.score", { me: match.turns.me, opponent: match.turns.opponent })}
      </Text>
      <View style={styles.maps}>
        {match.mode === "async" ? null : (
          <View style={styles.map}>
            <BoardMapPreview
              testID="details-my-map"
              level={levelOfMap(maps.mine)}
              taps={tapsOnMap(taps, "opponent", maps.mine.cols)}
              size={size}
            />
            <Text variant="caption" style={styles.secondary}>
              {t("arena.details.myMap", { name })}
            </Text>
          </View>
        )}
        <View style={styles.map}>
          <BoardMapPreview
            testID="details-their-map"
            level={levelOfMap(maps.opponent)}
            taps={tapsOnMap(taps, "me", maps.opponent.cols)}
            size={size}
          />
          <Text variant="caption" style={styles.secondary}>
            {t("arena.details.theirMap", { name })}
          </Text>
        </View>
      </View>
    </>
  );
};

export default MatchDetailsBody;
