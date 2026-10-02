import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { StreakMilestone } from "@entities/streak";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";

import type { MilestoneState } from "../model/milestone-track";

import { styles } from "./milestone-badge-styles";

interface IMilestoneBadge {
  milestone: StreakMilestone;
  state: MilestoneState;
}

const MilestoneBadge = ({ milestone, state }: IMilestoneBadge) => {
  const { theme } = useUnistyles();
  styles.useVariants({ state });
  const iconSize = theme.sizes.icon.s;

  return (
    <View style={styles.milestone}>
      <View style={styles.badge}>
        <Text variant="caption" style={styles.badgeText}>
          {milestone.days}
        </Text>
      </View>
      <View style={styles.reward}>
        <EmeraldIcon width={iconSize} height={iconSize} color={theme.colors.currency.emerald} />
        <Text variant="caption" style={styles.secondary}>
          {milestone.emeralds}
        </Text>
      </View>
    </View>
  );
};

export default MilestoneBadge;
