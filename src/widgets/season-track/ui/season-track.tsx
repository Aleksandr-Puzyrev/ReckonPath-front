import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { SeasonStep } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import SeasonStepCard from "./season-step-card";
import { styles } from "./season-track-styles";

interface ISeasonTrack {
  rp: number;
  steps: readonly SeasonStep[];
  isOnline: boolean;
  pendingStep: number | null;
  onClaim: (step: number) => void;
}

const SeasonTrack = ({ rp, steps, isOnline, pendingStep, onClaim }: ISeasonTrack) => {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <Text variant="eyebrow">{t("arena.track.title")}</Text>
        <Text variant="title.s" style={styles.rp}>
          {t("arena.track.rp", { rp: formatNumber(rp, i18n.language) })}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {steps.map((step) => (
          <SeasonStepCard
            key={step.step}
            step={step}
            isDisabled={!isOnline || pendingStep !== null}
            onClaim={onClaim}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default SeasonTrack;
