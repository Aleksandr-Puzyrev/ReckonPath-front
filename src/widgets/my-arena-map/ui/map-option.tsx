import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { ArenaMap } from "@entities/arena-map";
import { Text } from "@shared/ui/text";

import { mapSubtitleOf } from "../model/map-subtitle-of";

import { styles } from "./my-map-styles";

interface IMapOption {
  map: ArenaMap;
  isDisabled: boolean;
  renderMap: (map: ArenaMap, size: number) => ReactNode;
  onSelect: (id: string) => void;
}

const MapOption = ({ map, isDisabled, renderMap, onSelect }: IMapOption) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const subtitle = mapSubtitleOf(map, t);
  const canChoose = map.valid && !map.active && !isDisabled;
  styles.useVariants({ isActive: map.active });

  return (
    <Pressable
      testID={`map-option-${map.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${map.name}, ${subtitle}`}
      accessibilityState={{ disabled: !canChoose, selected: map.active }}
      disabled={!canChoose}
      onPress={() => onSelect(map.id)}
      style={styles.row}
    >
      {renderMap(map, theme.sizes.arena.switchMap)}
      <View style={styles.texts}>
        <Text variant="title.s" numberOfLines={1} style={map.valid ? null : styles.disabled}>
          {map.active ? t("arena.mapActive", { name: map.name }) : map.name}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
};

export default MapOption;
