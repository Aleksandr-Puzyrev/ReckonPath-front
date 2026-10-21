import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { formatDayMonth } from "@shared/lib";
import { SettingsRow } from "@shared/ui/settings-row";
import { Text } from "@shared/ui/text";

import AccountIcon from "@assets/icons/settings/account.svg";
import DeleteIcon from "@assets/icons/settings/delete.svg";
import LinkIcon from "@assets/icons/settings/link.svg";
import SignOutIcon from "@assets/icons/settings/sign-out.svg";

import SettingsGroup from "./settings-group";
import { styles } from "./settings-styles";

interface IAccountGroup {
  nickname: string | null;
  hasLogin: boolean;
  deletionAt: string | null;
  isSigningOut: boolean;
  onLink: () => void;
  onSignOut: () => void;
  onDelete: () => void;
  onDeletion: () => void;
}

const AccountGroup = ({
  nickname,
  hasLogin,
  deletionAt,
  isSigningOut,
  onLink,
  onSignOut,
  onDelete,
  onDeletion,
}: IAccountGroup) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { colors } = theme;

  return (
    <SettingsGroup title={t("settings.group.account")}>
      <SettingsRow
        Icon={AccountIcon}
        iconColor={colors.status.success}
        label={t("settings.account.status")}
        isFirst
        accessory={
          <Text variant="button.s" style={hasLogin ? styles.success : styles.value}>
            {hasLogin && nickname !== null ? nickname : t("settings.account.guest")}
          </Text>
        }
      />
      {hasLogin ? (
        <SettingsRow
          testID="settings-sign-out"
          Icon={SignOutIcon}
          iconColor={colors.rarity.common}
          label={t("settings.account.signOut")}
          onPress={isSigningOut ? undefined : onSignOut}
        />
      ) : (
        <SettingsRow
          testID="settings-link"
          Icon={LinkIcon}
          iconColor={colors.accent.blue}
          label={t("settings.account.link")}
          onPress={onLink}
        />
      )}
      <SettingsRow
        testID="settings-delete"
        Icon={DeleteIcon}
        iconColor={colors.status.danger}
        label={t("settings.account.delete")}
        subtitle={
          deletionAt === null
            ? undefined
            : t("settings.account.deletionAt", { date: formatDayMonth(deletionAt, i18n.language) })
        }
        isDestructive
        onPress={deletionAt === null ? onDelete : onDeletion}
      />
    </SettingsGroup>
  );
};

export default AccountGroup;
