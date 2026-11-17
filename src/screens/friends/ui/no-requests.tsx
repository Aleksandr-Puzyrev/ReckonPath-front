import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./friends-screen-styles";

const NoRequests = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.empty}>
      <Text testID="friends-no-requests" variant="body.m" style={styles.message}>
        {t("friends.noRequests")}
      </Text>
    </View>
  );
};

export default NoRequests;
