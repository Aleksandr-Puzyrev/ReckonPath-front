import { View } from "react-native";

import { Text } from "../text";

import { styles } from "./chip-styles";

interface IChip {
  label: string;
}

const Chip = ({ label }: IChip) => (
  <View style={styles.chip}>
    <Text variant="caption" style={styles.text}>
      {label}
    </Text>
  </View>
);

export default Chip;
