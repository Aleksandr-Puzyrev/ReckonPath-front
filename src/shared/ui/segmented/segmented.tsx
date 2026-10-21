import { Pressable, View } from "react-native";

import { Text } from "../text";

import { styles } from "./segmented-styles";

interface ISegmented<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

const Segmented = <T extends string>({ options, value, onChange, testID }: ISegmented<T>) => (
  <View style={styles.group} accessibilityRole="radiogroup" testID={testID}>
    {options.map((option) => {
      const isSelected = option.value === value;
      return (
        <Pressable
          key={option.value}
          testID={testID === undefined ? undefined : `${testID}-${option.value}`}
          accessibilityRole="radio"
          accessibilityLabel={option.label}
          accessibilityState={{ selected: isSelected }}
          onPress={() => onChange(option.value)}
          style={[styles.option, isSelected ? styles.selected : null]}
        >
          <Text variant="button.s" style={isSelected ? styles.selectedLabel : styles.label}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default Segmented;
