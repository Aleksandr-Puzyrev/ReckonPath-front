import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { styles } from "./profile-header-styles";

interface IProfileHeader {
  nickname: string;
  level: number;
  xp: number;
  xpToNext: number;
  isGuest: boolean;
}

const ProfileHeader = ({ nickname, level, xp, xpToNext, isGuest }: IProfileHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const progress = xpToNext > 0 ? Math.min(1, xp / xpToNext) : 0;

  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Gradient name="primary" radius={theme.sizes.avatar.profile / 2} />
        <Text variant="display.m" style={styles.letter}>
          {nickname.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text variant="title.l" numberOfLines={1} accessibilityRole="header">
          {nickname}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {isGuest ? t("profile.levelGuest", { level }) : t("profile.level", { level })}
        </Text>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: xpToNext, now: xp }}
        >
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text variant="caption" style={styles.secondary}>
          {t("profile.xp", { xp, max: xpToNext })}
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;
