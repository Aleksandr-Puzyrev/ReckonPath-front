import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { FoundPlayer } from "@entities/friend";
import type { ErrorMessageKey } from "@shared/api";
import { Text } from "@shared/ui/text";

import { styles } from "./add-friend-sheet-styles";
import FoundPlayerRow from "./found-player-row";

interface ISearchResults {
  isSearching: boolean;
  players: readonly FoundPlayer[] | undefined;
  errorKey: ErrorMessageKey | null;
  pendingUserId: string | null;
  isDisabled: boolean;
  onSend: (player: FoundPlayer) => void;
}

const SearchResults = ({
  isSearching,
  players,
  errorKey,
  pendingUserId,
  isDisabled,
  onSend,
}: ISearchResults) => {
  const { t } = useTranslation();

  if (!isSearching) {
    return (
      <Text variant="body.s" style={styles.secondary}>
        {t("friends.searchHint")}
      </Text>
    );
  }
  if (errorKey !== null) {
    return (
      <Text variant="body.s" style={styles.error} testID="friend-search-error">
        {t(errorKey)}
      </Text>
    );
  }
  if (players === undefined) return null;
  if (players.length === 0) {
    return (
      <Text variant="body.s" style={styles.secondary}>
        {t("friends.noResults")}
      </Text>
    );
  }
  return (
    <View style={styles.results}>
      {players.map((player) => (
        <FoundPlayerRow
          key={player.id}
          player={player}
          isDisabled={isDisabled || pendingUserId === player.id}
          onSend={onSend}
        />
      ))}
    </View>
  );
};

export default SearchResults;
