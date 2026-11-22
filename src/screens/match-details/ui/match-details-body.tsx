import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfBoard } from "@entities/match";
import type { MatchView } from "@entities/match";
import { formatDateTime } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { BoardMapPreview } from "@widgets/board";
import { trophyTextOf } from "@widgets/match-history";

import { tapsOfLog } from "../model/taps-of-log";

import { styles } from "./match-details-styles";

const RESULT_KEYS = {
  win: "result.pvp.win",
  loss: "result.pvp.lose",
  draw: "result.pvp.draw",
} as const;

interface IMatchDetailsBody {
  match: MatchView;
}

const MatchDetailsBody = ({ match }: IMatchDetailsBody) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { rival, myMap, rivalMap, result, format, log } = match;
  const name = rival.name;
  const size = theme.sizes.arena.detailsMap;

  return (
    <>
      <Text variant="title.l" accessibilityRole="header">
        {t("arena.details.title", { name })}
      </Text>
      {result === undefined ? null : (
        <Text variant="title.s">
          {`${t(RESULT_KEYS[result.outcome])} · ${trophyTextOf({ friendly: match.friendly, trophies: result.trophies }, t)}`}
        </Text>
      )}
      <Text variant="body.s" style={styles.secondary}>
        {t("arena.details.meta", {
          date: formatDateTime(match.serverTime, i18n.language),
          size: `${format.rows}×${format.cols}`,
        })}
      </Text>
      <Text variant="display.m" style={styles.score}>
        {t("arena.details.score", { me: match.me.moves, opponent: rival.moves })}
      </Text>
      <View style={styles.maps}>
        {myMap === undefined ? null : (
          <View style={styles.map}>
            <BoardMapPreview
              testID="details-my-map"
              level={levelOfBoard(myMap)}
              taps={tapsOfLog(log, "rival", myMap.cols)}
              size={size}
            />
            <Text variant="caption" style={styles.secondary}>
              {t("arena.details.myMap", { name })}
            </Text>
          </View>
        )}
        {rivalMap === undefined ? null : (
          <View style={styles.map}>
            <BoardMapPreview
              testID="details-their-map"
              level={levelOfBoard(rivalMap)}
              taps={tapsOfLog(log, "me", rivalMap.cols)}
              size={size}
            />
            <Text variant="caption" style={styles.secondary}>
              {t("arena.details.theirMap", { name })}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default MatchDetailsBody;
