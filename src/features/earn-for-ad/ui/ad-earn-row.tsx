import { Trans, useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { GEMS_FOR_AD } from "@shared/config";
import { Text } from "@shared/ui/text";
import type { AdMessageKey } from "@entities/ad";

import EmeraldIcon from "@assets/icons/play/emerald.svg";
import VideoIcon from "@assets/icons/play/video.svg";

import { useEarnForAd } from "../model/use-earn-for-ad";

import { styles } from "./ad-earn-row-styles";

interface IAdEarnRow {
  onMessage: (messageKey: AdMessageKey) => void;
}

const AdEarnRow = ({ onMessage }: IAdEarnRow) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const ad = useEarnForAd(onMessage);
  const isDisabled = ad.isPending || !ad.isOnline || ad.isLimitReached;
  styles.useVariants({ isDisabled });
  const iconSize = theme.sizes.icon.m;

  const caption = () => {
    if (ad.isPending) return t("ads.loading");
    if (!ad.isOnline) return t("ads.offline");
    if (ad.isLimitReached) return t("earn.adTomorrow");
    return t("earn.adToday", { used: ad.used, max: ad.max });
  };

  return (
    <Pressable
      testID="earn-ad"
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: ad.isPending }}
      accessibilityLabel={`${t("earn.adTitle")}, ${t("wallet.emeralds", { count: GEMS_FOR_AD })}, ${caption()}`}
      disabled={isDisabled}
      onPress={ad.handleWatch}
      style={styles.row}
    >
      <VideoIcon width={iconSize} height={iconSize} color={theme.colors.accent.cyan} />
      <View style={styles.texts}>
        <View style={styles.title}>
          <Text variant="title.s">{t("earn.adTitle")}</Text>
          <Text variant="title.s" style={styles.reward}>
            <Trans
              i18nKey="earn.adReward"
              values={{ amount: GEMS_FOR_AD }}
              components={{ icon: <EmeraldIcon width={iconSize} height={iconSize} /> }}
            />
          </Text>
        </View>
        <Text variant="caption" style={styles.caption}>
          {caption()}
        </Text>
      </View>
    </Pressable>
  );
};

export default AdEarnRow;
