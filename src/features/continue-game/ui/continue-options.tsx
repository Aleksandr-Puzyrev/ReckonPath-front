import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useGameSessionStore } from "@entities/level";
import { CONTINUE_GEM_PRICE } from "@shared/config";
import { haptic } from "@shared/haptics";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";
import VideoIcon from "@assets/icons/play/video.svg";

import { styles } from "./continue-options-styles";

interface IContinueOptions {
  onContinued: () => void;
}

const ContinueOptions = ({ onContinued }: IContinueOptions) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;

  // TODO: watch a rewarded ad (stage 3) instead of the dev-only free continue
  const handleFreeContinue = () => {
    useGameSessionStore.getState().continueGame();
    haptic("success");
    onContinued();
  };

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={styles.title}>
        {t("result.continue.title")}
      </Text>
      <View style={styles.row}>
        <View style={styles.option}>
          <Button
            label={t("result.continue.ad")}
            caption={t("ads.unavailable")}
            icon={
              <VideoIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />
            }
            isDisabled
            onPress={handleFreeContinue}
          />
        </View>
        <View style={styles.option}>
          {/* TODO: pay with emeralds once the wallet exists (stage 3) */}
          <Button
            label={String(CONTINUE_GEM_PRICE)}
            accessibilityLabel={t("result.continue.gems")}
            icon={<EmeraldIcon width={iconSize} height={iconSize} />}
            isDisabled
            onPress={handleFreeContinue}
          />
        </View>
      </View>
      {__DEV__ ? (
        <Button
          testID="continue-dev"
          label={t("result.continue.dev")}
          onPress={handleFreeContinue}
        />
      ) : null}
      <Text variant="caption" style={styles.note}>
        {t("result.continue.note")}
      </Text>
    </View>
  );
};

export default ContinueOptions;
