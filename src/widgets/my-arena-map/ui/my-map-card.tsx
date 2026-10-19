import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { ArenaMap } from "@entities/arena-map";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { mapSubtitleOf } from "../model/map-subtitle-of";

import { styles } from "./my-map-styles";

interface IMyMapCard {
  map: ArenaMap | null;
  canSwitch: boolean;
  renderMap: (map: ArenaMap, size: number) => ReactNode;
  onSwitch: () => void;
  onEdit: () => void;
  onCreate: () => void;
}

const MyMapCard = ({ map, canSwitch, renderMap, onSwitch, onEdit, onCreate }: IMyMapCard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  if (map === null) {
    return (
      <View style={styles.card}>
        <View style={styles.texts}>
          <Text variant="eyebrow" style={styles.secondary}>
            {t("arena.myMap")}
          </Text>
          <Text variant="title.s">{t("arena.noMap")}</Text>
          <Button
            testID="map-create"
            label={t("arena.createMap")}
            size="s"
            variant="secondary"
            onPress={onCreate}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card} testID="my-map">
      {renderMap(map, theme.sizes.arena.myMap)}
      <View style={styles.texts}>
        <Text variant="eyebrow" style={styles.secondary}>
          {t("arena.myMap")}
        </Text>
        <Text variant="title.s" numberOfLines={1}>
          {t("arena.mapActive", { name: map.name })}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {mapSubtitleOf(map, t)}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {t("arena.defended", { count: map.defended })}
        </Text>
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              testID="map-edit"
              label={t("arena.edit")}
              size="s"
              variant="secondary"
              onPress={onEdit}
            />
          </View>
          <View style={styles.action}>
            <Button
              testID="map-switch"
              label={t("arena.switch")}
              size="s"
              variant="secondary"
              isDisabled={!canSwitch}
              onPress={onSwitch}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MyMapCard;
