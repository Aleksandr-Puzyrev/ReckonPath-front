import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./arena-hero-styles";

interface IHeroStat {
  label: string;
  value: string;
}

const HeroStat = ({ label, value }: IHeroStat) => (
  <View style={styles.stat}>
    <Text variant="eyebrow" style={styles.dim} numberOfLines={1}>
      {label}
    </Text>
    <Text variant="title.s" style={styles.title} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default HeroStat;
