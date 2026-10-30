import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { styles } from "./profile-header-styles";

interface ProfileLevel {
  level: number;
  xp: number;
  xpToNext: number;
}

interface IProfileHeader {
  nickname: string;
  progress: ProfileLevel | null;
}

const ProfileHeader = ({ nickname, progress }: IProfileHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const fillShare =
    progress === null || progress.xpToNext <= 0 ? 0 : Math.min(1, progress.xp / progress.xpToNext);

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
        {progress === null ? null : (
          <>
            <Text variant="body.s" style={styles.secondary}>
              {t("profile.level", { level: progress.level })}
            </Text>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: progress.xpToNext, now: progress.xp }}
            >
              <View style={[styles.fill, { width: `${fillShare * 100}%` }]} />
            </View>
            <Text variant="caption" style={styles.secondary}>
              {t("profile.xp", { xp: progress.xp, max: progress.xpToNext })}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
