import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import { styles } from "./current-game-styles";

interface ICampaignDoneHero {
  total: number;
  belowThree: number;
  onCollect: () => void;
  onDaily: () => void;
}

const CampaignDoneHero = ({ total, belowThree, onCollect, onDaily }: ICampaignDoneHero) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.hero} testID="campaign-done">
      <Gradient name="heroHome" radius={theme.radius.xl} />
      <View style={styles.texts}>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("home.doneEyebrow")}
        </Text>
        <Text variant="display.l" style={styles.title} accessibilityRole="header">
          {t("home.campaignDone")}
        </Text>
        <Text variant="body.s" style={styles.subtitle}>
          {belowThree === 0
            ? t("home.doneAll", { total })
            : t("home.doneText", { total, count: belowThree })}
        </Text>
      </View>
      <View style={styles.actions}>
        {belowThree === 0 ? null : (
          <Button
            testID="campaign-collect"
            label={t("home.collect").toLocaleUpperCase()}
            variant="primary"
            size="l"
            onPress={onCollect}
          />
        )}
        <Button
          testID="campaign-daily"
          label={t("home.daily")}
          variant="secondary"
          size="l"
          onPress={onDaily}
        />
      </View>
    </View>
  );
};

export default CampaignDoneHero;
