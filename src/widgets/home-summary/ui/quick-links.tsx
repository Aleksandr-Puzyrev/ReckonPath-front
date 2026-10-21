import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import LockIcon from "@assets/icons/arena/lock.svg";
import ArenaIcon from "@assets/icons/tabs/arena.svg";
import ShopIcon from "@assets/icons/tabs/shop.svg";

import type { ArenaLink } from "../model/home-summary-type";

import { styles } from "./home-summary-styles";

interface IQuickLinks {
  arena: ArenaLink;
  dropLeft: string | null;
  onArena: () => void;
  onShop: () => void;
}

const QuickLinks = ({ arena, dropLeft, onArena, onShop }: IQuickLinks) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const iconColor = theme.colors.text.primary;
  const arenaStatus = arena.isUnlocked
    ? arena.status
    : t("home.links.arenaLocked", { n: arena.unlockLevel });

  return (
    <View style={styles.links}>
      <Pressable
        testID="home-arena"
        accessibilityRole="button"
        accessibilityLabel={[t("home.links.arena"), arenaStatus]
          .filter((part) => part !== "")
          .join(", ")}
        onPress={onArena}
        style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}
      >
        <ArenaIcon width={iconSize} height={iconSize} color={iconColor} />
        <Text variant="title.s">{t("home.links.arena")}</Text>
        <View style={styles.lockRow}>
          {arena.isUnlocked ? null : (
            <LockIcon
              width={theme.sizes.icon.s}
              height={theme.sizes.icon.s}
              color={theme.colors.text.secondary}
            />
          )}
          <Text variant="caption" style={styles.secondary}>
            {arenaStatus}
          </Text>
        </View>
      </Pressable>
      <Pressable
        testID="home-shop"
        accessibilityRole="button"
        accessibilityLabel={t("home.links.shop")}
        onPress={onShop}
        style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}
      >
        <View style={styles.linkHead}>
          <ShopIcon width={iconSize} height={iconSize} color={iconColor} />
          {dropLeft === null ? null : (
            <View style={styles.timer} testID="home-drop">
              <Text variant="eyebrow">{dropLeft}</Text>
            </View>
          )}
        </View>
        <Text variant="title.s">{t("home.links.shop")}</Text>
      </Pressable>
    </View>
  );
};

export default QuickLinks;
