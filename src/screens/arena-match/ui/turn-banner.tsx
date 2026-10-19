import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./arena-match-styles";

interface ITurnBanner {
  text: string;
  isMine: boolean;
}

const TurnBanner = ({ text, isMine }: ITurnBanner) => {
  styles.useVariants({ isMine });

  return (
    <View style={styles.banner} accessibilityLiveRegion="polite" testID="turn-banner">
      <Text variant="eyebrow" style={styles.bannerText}>
        {text}
      </Text>
    </View>
  );
};

export default TurnBanner;
