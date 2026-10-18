import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import LockIcon from "@assets/icons/arena/lock.svg";

import { ARENA_UNLOCK_LEVEL } from "../model/arena-unlock";

import { styles } from "./arena-locked-styles";

interface IArenaLocked {
  passed: number;
  onToLevels: () => void;
}

const CARDS = ["turns", "ownMap", "leagues"] as const;

const ArenaLocked = ({ passed, onToLevels }: IArenaLocked) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.wrap} testID="arena-locked">
      <View style={styles.hero}>
        <Gradient name="heroArena" radius={theme.radius.xl} />
        <View style={styles.lock}>
          <LockIcon
            width={theme.sizes.icon.xl}
            height={theme.sizes.icon.xl}
            color={theme.colors.text.onAccent}
          />
        </View>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("arena.eyebrow")}
        </Text>
        <Text variant="display.m" style={styles.light} accessibilityRole="header">
          {t("arena.lockedTitle")}
        </Text>
        <Text variant="body.m" style={styles.light}>
          {t("arena.locked")}
        </Text>
        <View style={styles.progressTexts}>
          <Text variant="caption" style={styles.light}>
            {t("arena.lockedProgress")}
          </Text>
          <Text variant="caption" style={styles.light}>
            {t("arena.lockedCount", { n: passed, total: ARENA_UNLOCK_LEVEL })}
          </Text>
        </View>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: ARENA_UNLOCK_LEVEL, now: passed }}
        >
          <View style={[styles.fill, { width: `${(passed / ARENA_UNLOCK_LEVEL) * 100}%` }]} />
        </View>
        <Button testID="arena-to-levels" label={t("arena.toLevels")} onPress={onToLevels} />
      </View>
      {CARDS.map((card) => (
        <View key={card} style={styles.card}>
          <Text variant="title.s">{t(`arena.lockedCards.${card}.title`)}</Text>
          <Text variant="body.s" style={styles.secondary}>
            {t(`arena.lockedCards.${card}.text`)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ArenaLocked;
