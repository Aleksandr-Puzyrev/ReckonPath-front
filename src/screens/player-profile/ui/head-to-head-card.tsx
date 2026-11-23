import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerProfile } from "@entities/player";
import { formatRelativeDay } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { styles } from "./player-profile-styles";

interface IHeadToHeadCard {
  profile: PlayerProfile;
  now: number;
}

const HeadToHeadCard = ({ profile, now }: IHeadToHeadCard) => {
  const { t, i18n } = useTranslation();
  const last = profile.headToHead?.last[0];

  return (
    <View style={styles.card} testID="player-head-to-head">
      <Text variant="eyebrow" style={styles.secondary}>
        {t("player.headToHead")}
      </Text>
      {profile.headToHead === undefined || last === undefined ? (
        <Text variant="body.m" style={styles.secondary}>
          {t("player.notMet")}
        </Text>
      ) : (
        <>
          <View
            style={styles.score}
            accessible
            accessibilityLabel={`${profile.headToHead.wins} : ${profile.headToHead.losses}`}
          >
            <Text variant="display.l" style={styles.mine}>
              {profile.headToHead.wins}
            </Text>
            <Text variant="title.l" style={styles.secondary}>
              :
            </Text>
            <Text variant="display.l" style={styles.theirs}>
              {profile.headToHead.losses}
            </Text>
          </View>
          <Text variant="body.s" style={styles.secondary}>
            {t("player.lastMatch", {
              name: profile.name,
              when: formatRelativeDay(last.finishedAt, now, i18n.language),
            })}
          </Text>
        </>
      )}
    </View>
  );
};

export default HeadToHeadCard;
