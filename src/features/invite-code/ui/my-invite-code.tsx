import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";

import type { Invite } from "@entities/friend";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./invite-code-styles";

interface IMyInviteCode {
  invite: Invite;
}

// The code is shared as text: the backend has no invite link yet (код отправляется текстом: ссылки-приглашения у бэкенда пока нет).
const MyInviteCode = ({ invite }: IMyInviteCode) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(invite.code);
    setIsCopied(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.codeRow}>
        <View style={styles.codeTexts}>
          <Text variant="eyebrow" style={styles.secondary}>
            {t("friends.myCode")}
          </Text>
          <Text variant="title.m" testID="invite-code" selectable>
            {invite.code}
          </Text>
        </View>
        <Button
          testID="invite-copy"
          label={isCopied ? t("friends.copied") : t("friends.copy")}
          onPress={() => void copy()}
        />
      </View>
      <Text variant="body.s" style={styles.secondary}>
        {t("friends.inviteReward", { gems: invite.rewardGems })}
      </Text>
      <Button
        testID="invite-share"
        label={t("friends.invite").toLocaleUpperCase()}
        variant="primary"
        size="l"
        onPress={() => void Share.share({ message: invite.code })}
      />
    </View>
  );
};

export default MyInviteCode;
