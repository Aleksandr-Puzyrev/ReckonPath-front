import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Ban } from "@entities/app-config";
import { useMeQuery } from "@entities/wallet";
import { SupportSheet } from "@features/contact-support";
import { Button } from "@shared/ui/button";
import { SystemIllustration } from "@shared/ui/system-illustration";
import { Text } from "@shared/ui/text";

import BanIcon from "@assets/icons/system/ban.svg";

import { banLinesOf } from "../model/ban-lines";

import { styles } from "./ban-notice-styles";

interface IBanNotice {
  ban: Ban;
  onCampaign: (() => void) | null;
  onMessage: (text: string) => void;
}

const BanNotice = ({ ban, onCampaign, onMessage }: IBanNotice) => {
  const { t, i18n } = useTranslation();
  const { data: me } = useMeQuery();
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const lines = banLinesOf(ban, me?.id ?? null, t, i18n.language);

  return (
    <View style={styles.root} testID="ban-notice">
      <SystemIllustration tone="danger" Icon={BanIcon} />
      <Text variant="display.m" accessibilityRole="header" style={styles.center}>
        {t(ban.scope === "arena" ? "system.banned.arenaTitle" : "system.banned.title")}
      </Text>
      <Text variant="body.m" style={styles.body}>
        {lines.join("\n")}
      </Text>
      <View style={styles.actions}>
        <Button
          testID="ban-appeal"
          label={t("system.banned.appeal")}
          variant="secondary"
          size="l"
          onPress={() => setIsAppealOpen(true)}
        />
        {onCampaign === null ? null : (
          <Button
            testID="ban-campaign"
            label={t("system.banned.toCampaign").toLocaleUpperCase()}
            variant="primary"
            size="l"
            onPress={onCampaign}
          />
        )}
      </View>
      <SupportSheet
        isOpen={isAppealOpen}
        topic="ban_appeal"
        title={t("system.banned.appeal")}
        onSent={() => {
          setIsAppealOpen(false);
          onMessage(t("system.appeal.sent"));
        }}
        onError={(messageKey) => onMessage(t(messageKey))}
        onClose={() => setIsAppealOpen(false)}
      />
    </View>
  );
};

export default BanNotice;
