import { View } from "react-native";

import { styles } from "./arena-home-styles";

const ArenaHomeSkeleton = () => (
  <View style={styles.skeleton} testID="arena-skeleton" accessibilityElementsHidden>
    <View style={styles.skeletonHero} />
    <View style={styles.skeletonButton} />
    <View style={styles.skeletonCard} />
    <View style={styles.skeletonCard} />
  </View>
);

export default ArenaHomeSkeleton;
