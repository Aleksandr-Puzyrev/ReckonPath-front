import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { useContinueForAd } from "../model/use-continue-for-ad";
import { useContinueForEmeralds } from "../model/use-continue-for-emeralds";
import type { ContinueCallbacks } from "../model/use-continue-for-emeralds";

import AdContinueButton from "./ad-continue-button";
import { styles } from "./continue-options-styles";

const ContinueOptions = ({ onContinued, onShortOfEmeralds, onError }: ContinueCallbacks) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const emeralds = useContinueForEmeralds({ onContinued, onShortOfEmeralds, onError });
  const ad = useContinueForAd({ onContinued, onMessage: onError });

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={styles.title}>
        {t("result.continue.title")}
      </Text>
      <View style={styles.row}>
        {ad.state === "limit" ? null : (
          <View style={styles.option}>
            <AdContinueButton state={ad.state} left={ad.left} onPress={ad.handlePress} />
          </View>
        )}
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
