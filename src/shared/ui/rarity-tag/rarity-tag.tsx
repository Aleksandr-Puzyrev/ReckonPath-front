import { View } from "react-native";

import { Text } from "../text";

import { styles } from "./rarity-tag-styles";

export type RarityLevel = "common" | "rare" | "epic" | "legendary";

interface IRarityTag {
  rarity: RarityLevel;
  label: string;
}

const RarityTag = ({ rarity, label }: IRarityTag) => {
  styles.useVariants({ rarity });

  return (
    <View style={styles.tag}>
      <Text variant="caption" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export default RarityTag;
