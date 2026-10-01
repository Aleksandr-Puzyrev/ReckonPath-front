import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import StarIcon from "@assets/icons/play/star.svg";

import { styles } from "./star-bar-styles";

interface IStarBar {
  share: number;
  marks: { three: number; two: number | null };
}

const PERCENT = 100;
const MARKS = [
  { stars: 3, key: "three" },
  { stars: 2, key: "two" },
] as const;

const StarBar = ({ share, marks }: IStarBar) => {
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s / 2;

  return (
    <View style={styles.bar} importantForAccessibility="no-hide-descendants">
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * PERCENT}%` }]} />
      </View>
      {MARKS.map(({ stars, key }) => {
        const share = marks[key];
        if (share === null) return null;
        return (
          <View key={key} style={[styles.mark, { left: `${share * PERCENT}%` }]}>
            <View style={styles.tick} />
            <View style={styles.markLabel}>
              <Text variant="caption" style={styles.markText}>
                {stars}
              </Text>
              <StarIcon width={iconSize} height={iconSize} color={theme.colors.text.secondary} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default StarBar;
