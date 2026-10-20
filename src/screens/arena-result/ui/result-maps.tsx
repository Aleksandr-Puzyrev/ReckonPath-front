import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { LevelInput, Idx } from "@reckon-path/engine";

import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";
import { BoardMapPreview } from "@widgets/board";

import type { ZoomedMap } from "../model/use-arena-result";

import { styles } from "./arena-result-styles";

interface IResultMaps {
  myLevel: LevelInput | null;
  theirLevel: LevelInput;
  myTaps: readonly Idx[];
  theirTaps: readonly Idx[];
  theirLabel: string;
  zoomed: ZoomedMap;
  onZoom: (map: ZoomedMap) => void;
}

const ResultMaps = ({
  myLevel,
  theirLevel,
  myTaps,
  theirTaps,
  theirLabel,
  zoomed,
  onZoom,
}: IResultMaps) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { width } = useWindowDimensions();
  const zoomSize = width - theme.space[5] * 2;

  return (
    <>
      <View style={styles.maps}>
        {myLevel === null ? null : (
          <Pressable
            testID="result-my-map"
            accessibilityRole="button"
            accessibilityLabel={t("result.pvp.myMap")}
            onPress={() => onZoom("mine")}
            style={styles.map}
          >
            <BoardMapPreview level={myLevel} taps={myTaps} size={theme.sizes.arena.detailsMap} />
            <Text variant="caption" style={styles.secondary}>
              {t("result.pvp.myMap")}
            </Text>
          </Pressable>
        )}
        <Pressable
          testID="result-their-map"
          accessibilityRole="button"
          accessibilityLabel={theirLabel}
          onPress={() => onZoom("theirs")}
          style={styles.map}
        >
          <BoardMapPreview
            level={theirLevel}
            taps={theirTaps}
            size={theme.sizes.arena.detailsMap}
          />
          <Text variant="caption" style={styles.secondary}>
            {theirLabel}
          </Text>
        </Pressable>
      </View>
      <Sheet isOpen={zoomed !== null} onDismiss={() => onZoom(null)}>
        <View style={styles.zoom}>
          {zoomed === "mine" && myLevel !== null ? (
            <BoardMapPreview level={myLevel} taps={myTaps} size={zoomSize} />
          ) : (
            <BoardMapPreview level={theirLevel} taps={theirTaps} size={zoomSize} />
          )}
        </View>
      </Sheet>
    </>
  );
};

export default ResultMaps;
