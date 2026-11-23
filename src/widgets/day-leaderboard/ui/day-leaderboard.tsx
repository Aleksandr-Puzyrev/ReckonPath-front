import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { DailyEntry, DailyLeaderboardScope } from "@entities/daily";
import { Segmented } from "@shared/ui/segmented";
import { Text } from "@shared/ui/text";

import { styles } from "./day-leaderboard-styles";
import LeaderboardNoFriends from "./leaderboard-no-friends";
import LeaderboardRow from "./leaderboard-row";

interface IDayLeaderboard {
  entries: readonly DailyEntry[];
  mine: DailyEntry | null;
  hasWon: boolean;
  scope: DailyLeaderboardScope;
  hasFriends: boolean;
  isOnline: boolean;
  onScopeChange: (scope: DailyLeaderboardScope) => void;
  onAddFriends: () => void;
  onOpenProfile: (playerId: string) => void;
}

const TOP_BEFORE_WIN = 3;
const TOP_AFTER_WIN = 10;

// Before their own win the player sees only the top, no spoilers; outside the friends list my row has no rank; only other players' rows open a profile (до своей победы игрок видит только верх топа, без спойлеров; вне списка друзей у моей строки нет места; профиль открывают только чужие строки).
const DayLeaderboard = ({
  entries,
  mine,
  hasWon,
  scope,
  hasFriends,
  isOnline,
  onScopeChange,
  onAddFriends,
  onOpenProfile,
}: IDayLeaderboard) => {
  const { t } = useTranslation();
  const rows = entries.slice(0, hasWon ? TOP_AFTER_WIN : TOP_BEFORE_WIN);
  const isMineShown = rows.some((entry) => entry.me === true);
  const isEmpty = scope === "friends" && !hasFriends;

  return (
    <View style={styles.card}>
      <Text variant="eyebrow">{t("daily.leaderboard")}</Text>
      <Segmented
        testID="leaderboard-scope"
        options={[
          { value: "all", label: t("daily.scope.all") },
          { value: "friends", label: t("daily.scope.friends") },
        ]}
        value={scope}
        onChange={onScopeChange}
      />
      {isEmpty ? <LeaderboardNoFriends isDisabled={!isOnline} onAddFriends={onAddFriends} /> : null}
      {isEmpty
        ? null
        : rows.map((entry) => {
            const playerId = entry.me === true ? undefined : entry.id;
            return (
              <LeaderboardRow
                key={entry.id ?? entry.rank}
                rank={entry.rank ?? null}
                name={entry.me === true ? t("daily.you") : (entry.name ?? "")}
                moves={entry.moves}
                isMine={entry.me === true}
                testID={`leaderboard-row-${entry.id ?? entry.rank}`}
                onPress={playerId === undefined ? undefined : () => onOpenProfile(playerId)}
              />
            );
          })}
      {isEmpty || mine === null || isMineShown ? null : (
        <LeaderboardRow rank={mine.rank ?? null} name={t("daily.you")} moves={mine.moves} isMine />
      )}
      {hasWon || isEmpty ? null : (
        <View style={styles.footer}>
          <Text variant="body.s" style={styles.secondary}>
            {t("daily.rankAfter")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DayLeaderboard;
