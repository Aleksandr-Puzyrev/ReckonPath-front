import { View } from "react-native";

import { styles } from "./profile-skeleton-styles";

const TILES = Array.from({ length: 8 }, (_, index) => index);

const ProfileSkeleton = () => (
  <View
    testID="profile-skeleton"
    style={styles.skeleton}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <View style={styles.header}>
      <View style={styles.avatar} />
      <View style={styles.lines}>
        <View style={styles.line} />
        <View style={[styles.line, styles.short]} />
      </View>
    </View>
    <View style={styles.grid}>
      {TILES.map((tile) => (
        <View key={tile} style={styles.tile} />
      ))}
    </View>
  </View>
);

export default ProfileSkeleton;
