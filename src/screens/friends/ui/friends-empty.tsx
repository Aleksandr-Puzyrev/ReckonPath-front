import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./friends-screen-styles";

interface IFriendsEmpty {
  isDisabled: boolean;
  onInvite: () => void;
}

const FriendsEmpty = ({ isDisabled, onInvite }: IFriendsEmpty) => {
  const { t } = useTranslation();

  return (
    <View style={styles.empty}>
      <Text variant="title.l" style={styles.emptyTitle}>
        {t("friends.empty")}
      </Text>
      <Text variant="body.m" style={styles.message}>
        {t("friends.emptyBody")}
      </Text>
      <Button
        testID="friends-invite"
        label={t("friends.inviteAction").toLocaleUpperCase()}
        variant="primary"
        size="l"
        isDisabled={isDisabled}
        onPress={onInvite}
      />
    </View>
  );
};

export default FriendsEmpty;
