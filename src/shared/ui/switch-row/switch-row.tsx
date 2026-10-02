import { Switch, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "../text";

import { styles } from "./switch-row-styles";

interface ISwitchRow {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
}

const SwitchRow = ({ label, isOn, onToggle, testID }: ISwitchRow) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.row}>
      <Text variant="body.l" style={styles.label}>
        {label}
      </Text>
      <Switch
        testID={testID}
        accessibilityLabel={label}
        value={isOn}
        onValueChange={onToggle}
        trackColor={{ true: theme.colors.accent.cyan, false: theme.colors.border.strong }}
        thumbColor={theme.colors.bg.surface}
      />
    </View>
  );
};

export default SwitchRow;
