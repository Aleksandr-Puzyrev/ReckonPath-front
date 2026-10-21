import { View } from "react-native";

import { Text } from "../text";
import { Toggle } from "../toggle";

import { styles } from "./switch-row-styles";

interface ISwitchRow {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
}

const SwitchRow = ({ label, isOn, onToggle, testID }: ISwitchRow) => (
  <View style={styles.row}>
    <Text variant="body.l" style={styles.label}>
      {label}
    </Text>
    <Toggle testID={testID} label={label} isOn={isOn} onToggle={onToggle} />
  </View>
);

export default SwitchRow;
