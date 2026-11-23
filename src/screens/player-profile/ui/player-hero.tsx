import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { PlayerProfile } from "@entities/player";
import { formatNumber } from "@shared/lib";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";
import { stepLabelOf } from "@widgets/arena-hero";

import { styles } from "./player-profile-styles";

interface IPlayerHero {
  profile: PlayerProfile;
}

const PlayerHero = ({ profile }: IPlayerHero) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const title = profile.look.title?.title;

  return (
    <View style={styles.hero}>
      <Gradient name="heroArena" radius={theme.radius.xl} />
      <View style={styles.avatar}>
        <Gradient name="primary" radius={theme.radius.xl} />
        <Text variant="display.m" style={styles.onHero}>
          {profile.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.heroTexts}>
        {title === undefined ? null : (
          <Text variant="eyebrow" style={styles.onHero} numberOfLines={1}>
            {title}
          </Text>
        )}
        <Text variant="title.l" style={styles.onHero} numberOfLines={1} accessibilityRole="header">
          {profile.name}
        </Text>
        <Text variant="body.s" style={styles.onHero}>
          {`${stepLabelOf(profile.league)} · ${formatNumber(profile.trophies, i18n.language)}`}
        </Text>
        <Text variant="body.s" style={styles.onHero} testID="player-rank">
          {t("player.rank", { rank: formatNumber(profile.rank, i18n.language) })}
        </Text>
      </View>
    </View>
  );
};

export default PlayerHero;
