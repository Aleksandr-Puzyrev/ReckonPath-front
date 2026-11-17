import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import type { FriendStatus } from "../model/friend-types";

import { styles } from "./friend-avatar-styles";

interface IFriendAvatar {
  name: string;
  size: "list" | "match";
  status?: FriendStatus;
}

const FriendAvatar = ({ name, size, status }: IFriendAvatar) => {
  const { theme } = useUnistyles();
  styles.useVariants({ size, status });

  return (
    <View style={styles.avatar}>
      <Gradient name="primary" radius={size === "list" ? theme.radius.s : theme.radius.m} />
      <Text variant={size === "list" ? "button.s" : "title.m"} style={styles.letter}>
        {name.slice(0, 1).toUpperCase()}
      </Text>
      {status === undefined ? null : <View style={styles.dot} />}
    </View>
  );
};

export default FriendAvatar;
