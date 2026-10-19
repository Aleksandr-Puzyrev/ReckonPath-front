import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./arena-map-styles";

interface IStatusLine {
  text: string;
  isValid: boolean;
}

const StatusLine = ({ text, isValid }: IStatusLine) => {
  styles.useVariants({ isValid });

  return (
    <View style={styles.status} testID="editor-status" accessibilityLiveRegion="polite">
      <Text variant="body.s" style={styles.statusText}>
        {text}
      </Text>
    </View>
  );
};

export default StatusLine;
