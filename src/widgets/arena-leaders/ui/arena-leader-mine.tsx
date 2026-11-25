import { useTranslation } from "react-i18next";

import type { LeaderboardPeriod, LeaderboardRow } from "@entities/leaderboard";
import { Text } from "@shared/ui/text";

import ArenaLeaderRow from "./arena-leader-row";
import { styles } from "./arena-leaders-styles";

interface IArenaLeaderMine {
  me: LeaderboardRow | undefined;
  period: LeaderboardPeriod;
  kind: "card" | "plain";
}

// The server sends my row only after a match in the period, otherwise a hint is shown (сервер присылает мою строку только после матча в периоде, иначе показывается подсказка).
const ArenaLeaderMine = ({ me, period, kind }: IArenaLeaderMine) => {
  const { t } = useTranslation();

  if (me !== undefined)
    return <ArenaLeaderRow row={me} kind={kind} isMine hasAvatar={kind === "card"} />;
  return (
    <Text variant="body.s" style={styles.hint} testID="leaders-no-me">
      {period === "week" ? t("leaderboard.noMeWeek") : t("leaderboard.noMeSeason")}
    </Text>
  );
};

export default ArenaLeaderMine;
