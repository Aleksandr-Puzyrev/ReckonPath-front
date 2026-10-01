import { Modal, View } from "react-native";

import { Button } from "../button";
import type { ButtonVariant } from "../button";
import { Text } from "../text";

import { styles } from "./dialog-styles";

export interface DialogAction {
  label: string;
  variant: ButtonVariant;
  onPress: () => void;
}

interface IDialog {
  isOpen: boolean;
  title: string;
  actions: readonly DialogAction[];
  onCancel: () => void;
}

const Dialog = ({ isOpen, title, actions, onCancel }: IDialog) => (
  <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.backdrop}>
      <View style={styles.card} accessibilityRole="alert">
        <Text variant="title.m" style={styles.title}>
          {title}
        </Text>
        <View style={styles.actions}>
          {actions.map((action) => (
            <View key={action.label} style={styles.action}>
              <Button label={action.label} variant={action.variant} onPress={action.onPress} />
            </View>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

export default Dialog;
