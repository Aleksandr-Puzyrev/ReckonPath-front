import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { FriendAvatar } from "@entities/friend";
import type { LeaderboardRow } from "@entities/leaderboard";
import { formatNumber } from "@shared/lib";
import { RankBadge } from "@shared/ui/rank-badge";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-leader-row-styles";

interface IArenaLeaderRow {
  row: LeaderboardRow;
  kind: "card" | "plain";
  isMine: boolean;
  hasAvatar: boolean;
  onOpenProfile?: (playerId: string) => void;
}

// My own row is not a link: my profile is the Profile tab (моя строка не ссылка: мой профиль — вкладка «Профиль»).
const ArenaLeaderRow = ({ row, kind, isMine, hasAvatar, onOpenProfile }: IArenaLeaderRow) => {
  const { t, i18n } = useTranslation();
  styles.useVariants({ kind, isMine });
  const name = isMine ? t("daily.you") : row.name;
  const value = formatNumber(row.value, i18n.language);
  const label = t("leaderboard.rowLabel", {
    rank: row.rank,
    name,
    trophies: t("friends.trophies", { count: row.value, value }),
  });
  const canOpen = !isMine && onOpenProfile !== undefined;

  return (
    <Pressable
      testID={`leader-${row.id}`}
      accessible
      accessibilityRole={canOpen ? "button" : undefined}
      accessibilityLabel={label}
      accessibilityHint={canOpen ? t("player.open", { name }) : undefined}
      disabled={!canOpen}
      onPress={canOpen ? () => onOpenProfile(row.id) : undefined}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <RankBadge rank={row.rank} />
      {hasAvatar ? <FriendAvatar name={row.name} size="list" /> : null}
      <Text variant="body.m" style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text variant="title.s" style={styles.value}>
        {value}
      </Text>
    </Pressable>
  );
};

export default ArenaLeaderRow;
