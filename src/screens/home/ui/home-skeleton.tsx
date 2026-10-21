import { View } from "react-native";

import { styles } from "./home-screen-styles";

const HomeSkeleton = () => (
  <View style={styles.skeleton} testID="home-skeleton" accessibilityElementsHidden>
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonTile} />
      <View style={styles.skeletonTile} />
    </View>
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonTile} />
      <View style={styles.skeletonTile} />
    </View>
  </View>
);

export default HomeSkeleton;
