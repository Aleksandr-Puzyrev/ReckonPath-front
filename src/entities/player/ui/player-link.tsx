import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { styles } from "./player-link-styles";

interface IPlayerLink {
  name: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: ReactNode;
}

const PlayerLink = ({ name, onPress, style, testID, children }: IPlayerLink) => {
  const { t } = useTranslation();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t("player.open", { name })}
      onPress={onPress}
      style={({ pressed }) => [styles.link, style, pressed ? styles.pressed : null]}
    >
      {children}
    </Pressable>
  );
};

export default PlayerLink;
