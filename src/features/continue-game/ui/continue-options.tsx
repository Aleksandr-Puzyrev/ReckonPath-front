import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";
import VideoIcon from "@assets/icons/play/video.svg";

import { useContinueForEmeralds } from "../model/use-continue-for-emeralds";
import type { ContinueCallbacks } from "../model/use-continue-for-emeralds";

import { styles } from "./continue-options-styles";

const ignorePress = () => undefined;

const ContinueOptions = ({ onContinued, onShortOfEmeralds, onError }: ContinueCallbacks) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const emeralds = useContinueForEmeralds({ onContinued, onShortOfEmeralds, onError });

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={styles.title}>
        {t("result.continue.title")}
      </Text>
      <View style={styles.row}>
        <View style={styles.option}>
          {/* TODO: watch a rewarded ad once the ads SDK exists (stage 3) */}
          <Button
            label={t("result.continue.ad")}
            caption={t("ads.unavailable")}
            icon={
              <VideoIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />
            }
            isDisabled
            onPress={ignorePress}
          />
        </View>
        <View style={styles.option}>
          <Button
            testID="continue-emeralds"
            label={String(emeralds.price)}
            accessibilityLabel={t("result.continue.gems")}
            icon={<EmeraldIcon width={iconSize} height={iconSize} />}
            isLabelDanger={!emeralds.canAfford}
            isDisabled={emeralds.isPending}
            onPress={emeralds.handlePress}
          />
        </View>
      </View>
      <Text variant="caption" style={styles.note}>
        {t("result.continue.note")}
      </Text>
    </View>
  );
};

export default ContinueOptions;
