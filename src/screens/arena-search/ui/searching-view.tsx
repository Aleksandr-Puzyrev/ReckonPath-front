import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfMap } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import type { QueueView } from "@entities/match";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { BoardMapPreview } from "@widgets/board";

import { styles } from "./arena-search-styles";
import Radar from "./radar";

interface ISearchingView {
  queue: QueueView | null;
  activeMap: ArenaMap | null;
  waitedMs: number;
  canPlayMap: boolean;
  isLeaving: boolean;
  onVsMap: () => void;
  onCancel: () => void;
}

const SearchingView = ({
  queue,
  activeMap,
  waitedMs,
  canPlayMap,
  isLeaving,
  onVsMap,
  onCancel,
}: ISearchingView) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.view}>
      <Radar />
      <Text variant="title.l" accessibilityRole="header" accessibilityLiveRegion="polite">
        {t("search.title")}
      </Text>
      <Text variant="number.counter" testID="search-timer">
        {formatDuration(waitedMs)}
      </Text>
      {queue === null ? null : (
        <Text variant="body.s" style={styles.secondary}>
          {t("search.format", {
            size: `${queue.format.rows}×${queue.format.cols}`,
            league: queue.format.leagueTitle.toUpperCase(),
            count: queue.format.targets,
          })}
        </Text>
      )}
      {activeMap === null ? null : (
        <View style={styles.mapCard}>
          <BoardMapPreview
            level={levelOfMap(activeMap.map)}
            taps={[]}
            size={theme.sizes.arena.switchMap}
          />
          <View style={styles.mapTexts}>
            <Text variant="eyebrow" style={styles.secondary}>
              {t("search.myMap")}
            </Text>
            <Text variant="title.s">{activeMap.name}</Text>
            {activeMap.botMoves === null ? null : (
              <Text variant="body.s" style={styles.secondary}>
                {t("arena.botEstimate", { count: activeMap.botMoves })}
              </Text>
            )}
          </View>
        </View>
      )}
      <View style={styles.actions}>
        {canPlayMap ? (
          <Button testID="search-vs-map" label={t("search.vsMap")} onPress={onVsMap} />
        ) : null}
        <Button
          testID="search-cancel"
          label={t("common.cancel")}
          variant="ghost"
          isDisabled={isLeaving}
          onPress={onCancel}
        />
      </View>
    </View>
  );
};

export default SearchingView;
