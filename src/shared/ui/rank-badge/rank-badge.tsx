import { View } from "react-native";

import { Text } from "../text";

import { medalOf } from "./medal-of";
import { styles } from "./rank-badge-styles";

interface IRankBadge {
  rank: number | null;
}

const RankBadge = ({ rank }: IRankBadge) => {
  styles.useVariants({ medal: medalOf(rank) });

  return (
    <View style={styles.badge}>
      <Text variant="caption" style={styles.text}>
        {rank}
      </Text>
    </View>
  );
};

export default RankBadge;
