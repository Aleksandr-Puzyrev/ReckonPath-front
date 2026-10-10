import { View } from "react-native";

import { styles } from "./shop-grid-skeleton-styles";

const ROWS = [0, 1] as const;

const ShopGridSkeleton = () => (
  <View
    style={styles.grid}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {ROWS.map((row) => (
      <View key={row} style={styles.row}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>
    ))}
  </View>
);

export default ShopGridSkeleton;
