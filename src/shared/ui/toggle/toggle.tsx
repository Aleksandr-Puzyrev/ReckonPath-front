import { Switch } from "react-native";
import { useUnistyles } from "react-native-unistyles";

interface IToggle {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
  isDisabled?: boolean;
}

const Toggle = ({ label, isOn, onToggle, testID, isDisabled = false }: IToggle) => {
  const { theme } = useUnistyles();

  return (
    <Switch
      testID={testID}
      accessibilityLabel={label}
      value={isOn}
      disabled={isDisabled}
      onValueChange={onToggle}
      trackColor={{ true: theme.colors.accent.cyan, false: theme.colors.border.strong }}
      thumbColor={theme.colors.bg.surface}
    />
  );
};

export default Toggle;
