import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useLeaderboardQuery } from "@entities/leaderboard";
import type { LeaderboardPeriod } from "@entities/leaderboard";
import { Button } from "@shared/ui/button";
import { Segmented } from "@shared/ui/segmented";
import { Text } from "@shared/ui/text";

import ArenaLeaderMine from "./arena-leader-mine";
import ArenaLeaderRow from "./arena-leader-row";
import ArenaLeadersStatus from "./arena-leaders-status";
import { styles } from "./arena-leaders-styles";

interface IArenaLeaders {
  isOnline: boolean;
  onOpenAll: () => void;
  onOpenProfile: (playerId: string) => void;
}

const TOP_SIZE = 3;

// Offline without a cached board the block is hidden: the arena already shows its offline banner (без сети и без сохранённой таблицы блок скрыт: арена уже показывает свой баннер).
const ArenaLeaders = ({ isOnline, onOpenAll, onOpenProfile }: IArenaLeaders) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const board = useLeaderboardQuery(period, "all");
  const me = board.data?.me;
  const top = board.data?.items.slice(0, TOP_SIZE) ?? [];
  const isMineInTop = me !== undefined && me.rank <= TOP_SIZE;

  if (board.data === undefined && !isOnline) return null;
  return (
    <View style={styles.block} testID="arena-leaders">
      <View style={styles.head}>
        <Text variant="eyebrow">{t("leaderboard.leaders")}</Text>
        <View style={styles.segment}>
          <Segmented
            testID="leaders-period"
            options={[
              { value: "week", label: t("leaderboard.week") },
              { value: "season", label: t("leaderboard.season") },
            ]}
            value={period}
            onChange={setPeriod}
          />
        </View>
      </View>
      <View style={styles.card}>
        {board.data === undefined ? (
          <ArenaLeadersStatus
            isPending={board.isPending}
            error={board.error}
            onRetry={() => void board.refetch()}
          />
        ) : null}
        {board.data?.items.length === 0 ? (
          <Text variant="body.s" style={styles.hint}>
            {t("leaderboard.empty")}
          </Text>
        ) : null}
        {top.map((row) => (
          <ArenaLeaderRow
            key={row.id}
            row={row}
            kind="plain"
            isMine={row.id === me?.id}
            hasAvatar={false}
            onOpenProfile={onOpenProfile}
          />
        ))}
        {top.length === 0 || isMineInTop ? null : (
          <ArenaLeaderMine me={me} period={period} kind="plain" />
        )}
      </View>
      <Button
        testID="leaders-all"
        label={t("leaderboard.all")}
        variant="ghost"
        onPress={onOpenAll}
      />
    </View>
  );
};

export default ArenaLeaders;
