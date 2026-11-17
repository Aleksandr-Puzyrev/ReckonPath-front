import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { FriendsList } from "@entities/friend";
import { Text } from "@shared/ui/text";

import ChevronRightIcon from "@assets/icons/levels/chevron-right.svg";

import { styles } from "./profile-friends-row-styles";

interface IProfileFriendsRow {
  counts: FriendsList["counts"];
  onPress: () => void;
}

const ProfileFriendsRow = ({ counts, onPress }: IProfileFriendsRow) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const label = t("profile.friends", { count: counts.friends, online: counts.online });
  const hasRequests = counts.incoming > 0;

  return (
    <Pressable
      testID="profile-friends"
      accessibilityRole="button"
      accessibilityLabel={
        hasRequests ? `${label}, ${t("friends.requestsCount", { count: counts.incoming })}` : label
      }
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text variant="title.s" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {hasRequests ? (
        <View style={styles.badge} testID="profile-friends-badge">
          <Text variant="caption" style={styles.badgeText}>
            {counts.incoming}
          </Text>
        </View>
      ) : null}
      <ChevronRightIcon
        width={theme.sizes.icon.m}
        height={theme.sizes.icon.m}
        color={theme.colors.text.secondary}
      />
    </Pressable>
  );
};

export default ProfileFriendsRow;
