import { View } from "react-native";

import { styles } from "./devices-skeleton-styles";

const ROWS = [0, 1];

const DevicesSkeleton = () => (
  <View
    testID="devices-skeleton"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {ROWS.map((row) => (
      <View key={row} style={styles.row}>
        <View style={styles.line} />
        <View style={[styles.line, styles.short]} />
      </View>
    ))}
  </View>
);

export default DevicesSkeleton;
