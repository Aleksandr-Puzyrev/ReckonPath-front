import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ArenaMap } from "@entities/arena-map";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import MapOption from "./map-option";
import { styles } from "./my-map-styles";

interface IMapSwitchSheet {
  isOpen: boolean;
  maps: readonly ArenaMap[];
  formatLabel: string;
  isDisabled: boolean;
  renderMap: (map: ArenaMap, size: number) => ReactNode;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

const MapSwitchSheet = ({
  isOpen,
  maps,
  formatLabel,
  isDisabled,
  renderMap,
  onSelect,
  onDismiss,
}: IMapSwitchSheet) => {
  const { t } = useTranslation();

  return (
    <Sheet isOpen={isOpen} onDismiss={onDismiss}>
      <View style={styles.sheet}>
        <Text variant="title.m" accessibilityRole="header">
          {t("arena.maps.title")}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {formatLabel}
        </Text>
        {maps.map((map) => (
          <MapOption
            key={map.id}
            map={map}
            isDisabled={isDisabled}
            renderMap={renderMap}
            onSelect={onSelect}
          />
        ))}
        {/* TODO: open the map editor once it exists (stage 4 task 4) */}
        <Button
          label={t("arena.maps.editInEditor")}
          variant="secondary"
          isDisabled
          onPress={() => undefined}
        />
      </View>
    </Sheet>
  );
};

export default MapSwitchSheet;
