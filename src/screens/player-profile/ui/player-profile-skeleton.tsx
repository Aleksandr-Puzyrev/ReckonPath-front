import { View } from "react-native";

import { styles } from "./player-profile-styles";

const PlayerProfileSkeleton = () => (
  <View
    testID="player-skeleton"
    style={styles.status}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <View style={styles.skeletonHero} />
    <View style={styles.skeletonCard} />
    <View style={styles.stats}>
      <View style={[styles.stat, styles.skeletonCard]} />
      <View style={[styles.stat, styles.skeletonCard]} />
      <View style={[styles.stat, styles.skeletonCard]} />
    </View>
  </View>
);

export default PlayerProfileSkeleton;
