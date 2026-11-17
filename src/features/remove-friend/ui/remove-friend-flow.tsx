import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Friend } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import type { useRemoveFriend } from "../model/use-remove-friend";

import { styles } from "./remove-friend-flow-styles";

interface IRemoveFriendFlow {
  friend: Friend | null;
  remove: ReturnType<typeof useRemoveFriend>;
  onClose: () => void;
}

const RemoveFriendFlow = ({ friend, remove, onClose }: IRemoveFriendFlow) => {
  const { t } = useTranslation();

  return (
    <>
      <Sheet isOpen={friend !== null} onDismiss={onClose}>
        <View style={styles.sheet}>
          <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
            {friend?.name ?? ""}
          </Text>
          <Button
            testID="friend-remove"
            label={t("friends.remove")}
            variant="danger"
            size="l"
            onPress={() => {
              remove.ask(friend);
              onClose();
            }}
          />
        </View>
      </Sheet>
      <Dialog
        isOpen={remove.confirming !== null}
        title={t("friends.removeConfirm", { name: remove.confirming?.name ?? "" })}
        onCancel={remove.cancel}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: remove.cancel },
          {
            label: t("friends.remove"),
            variant: "danger",
            onPress: remove.confirm,
            testID: "friend-remove-confirm",
          },
        ]}
      />
    </>
  );
};

export default RemoveFriendFlow;
