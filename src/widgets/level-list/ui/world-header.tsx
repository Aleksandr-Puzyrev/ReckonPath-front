import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import type { GradientName } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import StarIcon from "@assets/icons/play/star.svg";

import type { WorldItem } from "../model/build-list-items";

import { styles } from "./world-header-styles";

const COVERS: readonly GradientName[] = ["world1", "world2", "world3", "world4"];

// TODO: covers for worlds 5–8 come from the designer; until then they repeat worlds 1–4
const coverOf = (world: number) => COVERS[(world - 1) % COVERS.length] ?? "world1";

interface IWorldHeader {
  item: WorldItem;
}

const WorldHeader = ({ item }: IWorldHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { world, isUnlocked, isPerfect, stars, maxStars } = item;
  styles.useVariants({ isUnlocked, isPerfect });
  const name = t(`levels.world.name.${world.number}`);
  const subtitle = isUnlocked
    ? t(`levels.world.subtitle.${world.number}`)
    : t("levels.worldLocked", { n: world.number - 1 });

  return (
    <View style={styles.card} accessible accessibilityLabel={`${name}, ${subtitle}`}>
      {isUnlocked ? <Gradient name={coverOf(world.number)} radius={theme.radius.xl} /> : null}
      <View style={styles.texts}>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("levels.world.label", { n: world.number })}
        </Text>
        <Text variant="title.m" style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.side}>
        {isPerfect ? (
          <View style={styles.badge}>
            <Gradient name="perfectBadge" radius={theme.radius.m} />
            <Text variant="eyebrow" style={styles.badgeText}>
              {t("levels.world.perfect")}
            </Text>
          </View>
        ) : null}
        {maxStars === 0 ? null : (
          <View style={styles.stars}>
            <StarIcon
              width={theme.sizes.icon.s}
              height={theme.sizes.icon.s}
              color={theme.colors.text.onAccent}
            />
            <Text variant="number.counter" style={styles.starsText}>
              {`${stars} / ${maxStars}`}
            </Text>
          </View>
        )}
        <Text variant="caption" style={styles.range}>
          {`${world.firstLevel}–${world.lastLevel}`}
        </Text>
      </View>
    </View>
  );
};

export default WorldHeader;
