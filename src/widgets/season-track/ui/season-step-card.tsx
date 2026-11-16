import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { TrackStepView } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import CheckIcon from "@assets/icons/levels/check.svg";
import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./season-track-styles";

interface ISeasonStepCard {
  step: TrackStepView;
  isDisabled: boolean;
  onClaim: (step: number) => void;
}

const SeasonStepCard = ({ step, isDisabled, onClaim }: ISeasonStepCard) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { state } = step;
  const iconSize = theme.sizes.icon.l;
  const isGems = step.gems > 0;
  const Icon = isGems ? EmeraldIcon : CoinIcon;
  const amount = isGems ? step.gems : step.coins;
  styles.useVariants({ state });

  return (
    <View style={styles.card} testID={`season-step-${step.id}`}>
      <Text variant="caption" style={styles.secondary}>
        {t("arena.track.stepRp", { rp: formatNumber(step.rp, i18n.language) })}
      </Text>
      {step.item === undefined || amount > 0 ? (
        <>
          <View style={styles.icon}>
            <Icon width={iconSize} height={iconSize} />
          </View>
          <Text variant="title.s">{formatNumber(amount, i18n.language)}</Text>
        </>
      ) : (
        <Text variant="title.s" numberOfLines={2}>
          {step.item.title}
        </Text>
      )}
      {state === "ready" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={() => onClaim(step.id)}
          style={styles.claim}
        >
          <Text variant="button.s" style={styles.claimLabel}>
            {t("season.claim")}
          </Text>
        </Pressable>
      ) : (
        <View
          style={styles.status}
          accessible
          accessibilityLabel={
            state === "claimed" ? t("arena.track.claimed") : t("arena.track.locked")
          }
        >
          {state === "claimed" ? (
            <CheckIcon
              width={theme.sizes.icon.s}
              height={theme.sizes.icon.s}
              color={theme.colors.status.success}
            />
          ) : (
            <Text variant="caption" style={styles.secondary}>
              {t("arena.track.locked")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SeasonStepCard;
