import { View } from "react-native";

import { styles } from "./leaderboards-styles";

const SKELETON_ROWS = ["first", "second", "third", "fourth", "fifth"] as const;

const LeaderboardsSkeleton = () => (
  <View
    testID="leaderboards-skeleton"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {SKELETON_ROWS.map((key) => (
      <View key={key} style={styles.skeletonRow} />
    ))}
  </View>
);

export default LeaderboardsSkeleton;
