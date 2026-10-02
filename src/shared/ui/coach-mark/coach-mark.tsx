import { View } from "react-native";

import { Button } from "../button";
import { Text } from "../text";

import { styles } from "./coach-mark-styles";

export interface CoachAction {
  label: string;
  onPress: () => void;
}

interface ICoachMark {
  text: string;
  action?: CoachAction;
  secondaryAction?: CoachAction;
}

const CoachMark = ({ text, action, secondaryAction }: ICoachMark) => (
  <View style={styles.card} accessibilityLiveRegion="polite">
    <Text variant="body.m" style={styles.text}>
      {text}
    </Text>
    {action === undefined && secondaryAction === undefined ? null : (
      <View style={styles.actions}>
        {secondaryAction === undefined ? null : (
          <Button
            label={secondaryAction.label}
            onPress={secondaryAction.onPress}
            variant="ghost"
            size="s"
          />
        )}
        {action === undefined ? null : (
          <Button label={action.label} onPress={action.onPress} variant="primary" size="s" />
        )}
      </View>
    )}
  </View>
);

export default CoachMark;
