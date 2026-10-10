import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import ProfileSkeleton from "./profile-skeleton";
import { styles } from "./profile-status-styles";

interface IProfileStatus {
  isPending: boolean;
  isOnline: boolean;
  onRetry: () => void;
}

const ProfileStatus = ({ isPending, isOnline, onRetry }: IProfileStatus) => {
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) return <ProfileSkeleton />;
  return (
    <View style={styles.error}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="profile-retry" label={t("common.retry")} onPress={onRetry} />
    </View>
  );
};

export default ProfileStatus;
