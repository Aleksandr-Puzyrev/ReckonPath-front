import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FriendAvatar } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { useChallengeBanner } from "../model/use-challenge-banner";

import { styles } from "./challenge-banner-styles";

const PERCENT = 100;

interface IChallengeBanner {
  isHidden: boolean;
  onToast: (text: string) => void;
}

const ChallengeBanner = ({ isHidden, onToast }: IChallengeBanner) => {
  const { t } = useTranslation();
  const banner = useChallengeBanner(isHidden, onToast);
  const { challenge } = banner;

  if (challenge === null) return null;

  const { name } = challenge.from;

  return (
    <View style={styles.banner} testID="challenge-banner" accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <FriendAvatar name={name} size="match" />
        <View style={styles.texts}>
          <Text variant="title.s" numberOfLines={1}>
            {t("friends.challenge.incoming", { name })}
          </Text>
          <Text variant="body.s" style={styles.secondary} numberOfLines={1}>
            {t("friends.challenge.incomingSub", {
              size: `${challenge.format.rows}×${challenge.format.cols}`,
            })}
          </Text>
        </View>
        <Button
          testID="challenge-decline"
          label={t("friends.challenge.decline")}
          size="s"
          isDisabled={banner.isPending}
          onPress={banner.handleDecline}
        />
        <Button
          testID="challenge-accept"
          label={t("friends.challenge.accept")}
          variant="primary"
          size="s"
          isDisabled={banner.isPending}
          onPress={banner.handleAccept}
        />
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${banner.share * PERCENT}%` }]} />
      </View>
    </View>
  );
};

export default ChallengeBanner;
