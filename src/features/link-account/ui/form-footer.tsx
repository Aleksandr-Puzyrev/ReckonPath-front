import { Pressable, View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./form-footer-styles";

interface IFormFooter {
  question: string;
  action: string;
  onPress: () => void;
}

const FormFooter = ({ question, action, onPress }: IFormFooter) => (
  <View style={styles.footer}>
    <Text variant="body.m" style={styles.question}>
      {question}
    </Text>
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.action}>
      <Text variant="title.s" style={styles.actionText}>
        {action}
      </Text>
    </Pressable>
  </View>
);

export default FormFooter;
