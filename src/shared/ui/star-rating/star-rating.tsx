import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import StarIcon from "@assets/icons/play/star.svg";

import { styles } from "./star-rating-styles";

interface IStarRating {
  stars: number;
  size?: "s" | "l";
  accessibilityLabel?: string;
}

const SLOTS = [1, 2, 3] as const;

const StarRating = ({ stars, size = "s", accessibilityLabel }: IStarRating) => {
  const { theme } = useUnistyles();
  const iconSize = size === "s" ? theme.sizes.icon.s : theme.sizes.icon.xl;

  return (
    <View
      style={styles.row}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {SLOTS.map((slot) => (
        <StarIcon
          key={slot}
          width={iconSize}
          height={iconSize}
          color={slot <= stars ? theme.colors.currency.coin : theme.colors.border.strong}
        />
      ))}
    </View>
  );
};

export default StarRating;
