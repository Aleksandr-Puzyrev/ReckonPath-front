import type { ReactNode } from "react";
import { View } from "react-native";

import { Button } from "../button";
import { Text } from "../text";

import { styles } from "./coach-mark-styles";

export interface CoachAction {
  label: string;
  onPress: () => void;
}

interface ICoachMark {
  title?: string;
  icon?: ReactNode;
  text: string;
  caption?: string;
  action?: CoachAction;
  secondaryAction?: CoachAction;
}

const CoachMark = ({ title, icon, text, caption, action, secondaryAction }: ICoachMark) => (
  <View style={styles.card} accessibilityLiveRegion="polite">
    <View style={styles.body}>
      {icon}
      <View style={styles.texts}>
        {title === undefined ? null : (
          <Text variant="title.s" style={styles.text}>
            {title}
          </Text>
        )}
        <Text variant="body.m" style={styles.text}>
          {text}
        </Text>
      </View>
    </View>
    {action === undefined && secondaryAction === undefined ? null : (
      <View style={styles.actions}>
        {caption === undefined ? null : (
          <Text variant="caption" style={styles.caption}>
            {caption}
          </Text>
        )}
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
