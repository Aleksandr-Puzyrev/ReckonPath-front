import { View } from "react-native";
import type { ViewProps } from "react-native";

import { styles } from "./screen-styles";

const Screen = ({ style, ...props }: ViewProps) => (
  <View {...props} style={[styles.screen, style]} />
);

export default Screen;
