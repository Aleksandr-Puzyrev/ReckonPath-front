import { View } from "react-native";

import { styles } from "./friends-screen-styles";

const SKELETON_ROWS = ["first", "second", "third"] as const;

const FriendsSkeleton = () => (
  <View
    testID="friends-skeleton"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {SKELETON_ROWS.map((key) => (
      <View key={key} style={styles.skeletonRow} />
    ))}
  </View>
);

export default FriendsSkeleton;
