import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { Arena } from "@entities/arena";
import { levelOfMap } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { leagueLabelOf } from "@widgets/arena-hero";
import { BoardMapPreview } from "@widgets/board";

import { styles } from "./arena-search-styles";
import Radar from "./radar";

interface ISearchingView {
  arena: Arena | undefined;
  activeMap: ArenaMap | null;
  waitedSec: number;
  isAsyncAvailable: boolean;
  onCancel: () => void;
}

const MS_PER_SECOND = 1000;

const SearchingView = ({
  arena,
  activeMap,
  waitedSec,
  isAsyncAvailable,
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
        {formatDuration(waitedSec * MS_PER_SECOND)}
      </Text>
      {arena === undefined ? null : (
        <Text variant="body.s" style={styles.secondary}>
          {t("search.format", {
            size: `${arena.format.size}×${arena.format.size}`,
            league: leagueLabelOf(arena.profile.league, arena.profile.division),
            count: arena.format.targets,
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
            {activeMap.botNorm === null ? null : (
              <Text variant="body.s" style={styles.secondary}>
                {t("arena.botEstimate", { count: activeMap.botNorm })}
              </Text>
            )}
          </View>
        </View>
      )}
      <View style={styles.actions}>
        {isAsyncAvailable ? (
          // TODO: start the async match (stage 4 task 8)
          <Button
            testID="search-vs-map"
            label={t("search.vsMap")}
            isDisabled
            onPress={() => undefined}
          />
        ) : null}
        <Button
          testID="search-cancel"
          label={t("common.cancel")}
          variant="ghost"
          onPress={onCancel}
        />
      </View>
    </View>
  );
};

export default SearchingView;
