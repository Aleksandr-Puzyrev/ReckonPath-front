import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-search-styles";

interface NoticeAction {
  label: string;
  testID: string;
  onPress: () => void;
}

interface INoticeView {
  title: string;
  text: string;
  primary: NoticeAction;
  secondary: NoticeAction;
}

const NoticeView = ({ title, text, primary, secondary }: INoticeView) => (
  <View style={styles.view}>
    <Text variant="title.l" accessibilityRole="header">
      {title}
    </Text>
    <Text variant="body.m" style={[styles.secondary, styles.centered]}>
      {text}
    </Text>
    <View style={styles.actions}>
      <Button testID={primary.testID} label={primary.label} onPress={primary.onPress} />
      <Button
        testID={secondary.testID}
        label={secondary.label}
        variant="ghost"
        onPress={secondary.onPress}
      />
    </View>
  </View>
);

export default NoticeView;
