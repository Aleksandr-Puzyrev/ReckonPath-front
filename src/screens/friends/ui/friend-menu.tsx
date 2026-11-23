import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Friend } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./friends-screen-styles";

interface IFriendMenu {
  friend: Friend | null;
  onBlock: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
  onClose: () => void;
}

const FriendMenu = ({ friend, onBlock, onRemove, onClose }: IFriendMenu) => {
  const { t } = useTranslation();
  const choose = (action: (friend: Friend) => void) => {
    if (friend !== null) action(friend);
    onClose();
  };

  return (
    <Sheet isOpen={friend !== null} onDismiss={onClose}>
      <View style={styles.menu}>
        <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
          {friend?.name ?? ""}
        </Text>
        <Button
          testID="friend-block"
          label={t("block.action")}
          variant="secondary"
          size="l"
          onPress={() => choose(onBlock)}
        />
        <Button
          testID="friend-remove"
          label={t("friends.remove")}
          variant="danger"
          size="l"
          onPress={() => choose(onRemove)}
        />
      </View>
    </Sheet>
  );
};

export default FriendMenu;
