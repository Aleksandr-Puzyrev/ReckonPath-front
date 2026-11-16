import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { CampaignGame } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { useContinueCampaignGame } from "../model/use-continue-campaign-game";
import type { ContinueCallbacks } from "../model/use-continue-for-emeralds";

import { styles } from "./continue-options-styles";

interface ICampaignContinueOptions extends ContinueCallbacks {
  game: CampaignGame;
}

// The ad continue stays hidden until the server can check the view (продолжение за рекламу скрыто, пока сервер не умеет проверять просмотр).
const CampaignContinueOptions = ({ game, ...callbacks }: ICampaignContinueOptions) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const gems = useContinueCampaignGame(game, callbacks);

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={styles.title}>
        {t("result.continue.title")}
      </Text>
      <View style={styles.row}>
        <View style={styles.option}>
          <Button
            testID="continue-emeralds"
            label={String(gems.price)}
            accessibilityLabel={t("result.continue.gems")}
            icon={<EmeraldIcon width={iconSize} height={iconSize} />}
            isLabelDanger={!gems.canAfford}
            isDisabled={gems.isPending}
            onPress={gems.handlePress}
          />
        </View>
      </View>
      <Text variant="caption" style={styles.note}>
        {t("result.continue.note")}
      </Text>
    </View>
  );
};

export default CampaignContinueOptions;
