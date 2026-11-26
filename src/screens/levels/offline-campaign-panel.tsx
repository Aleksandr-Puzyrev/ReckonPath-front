import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  canResumeOffline,
  isPackCurrent,
  nextOfflineLevel,
  useOfflineCampaign,
} from "@entities/offline-campaign";
import { formatDateTime } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./levels-screen-styles";

const openLevel = (level: number) =>
  router.push({
    pathname: "/play/[mode]/[id]",
    params: { mode: "offline", id: String(level) },
  });

const OfflineCampaignPanel = ({ isOffline }: { isOffline: boolean }) => {
  const { t, i18n } = useTranslation();
  const pack = useOfflineCampaign((state) => state.pack);
  const pending = useOfflineCampaign((state) => state.pending);
  const active = useOfflineCampaign((state) => state.active);
  const syncBlocked = useOfflineCampaign((state) => state.syncBlocked);
  const rejected = useOfflineCampaign((state) => state.rejected);
  const clearRejections = useOfflineCampaign((state) => state.clearRejections);
  const available = pack !== null && isPackCurrent(pack);
  const resumable = pack !== null && active?.packId === pack.packId && canResumeOffline(pack);
  const level = resumable ? active.level : available ? nextOfflineLevel(pack, pending) : undefined;

  if (pack === null && !isOffline && pending.length === 0 && rejected === 0) return null;
  return (
    <View style={styles.offlinePanel}>
      <Text variant="eyebrow" accessibilityRole="header">
        {t("offlineCampaign.title")}
      </Text>
      {available ? (
        <Text variant="body.s">
          {t("offlineCampaign.readyUntil", { date: formatDateTime(pack.expiresAt, i18n.language) })}
        </Text>
      ) : (
        <Text variant="body.s">
          {t(pack === null ? "offlineCampaign.unavailable" : "offlineCampaign.expired")}
        </Text>
      )}
      {level !== undefined && isOffline && (
        <Button
          label={t("offlineCampaign.playLevel", { level })}
          variant="primary"
          onPress={() => openLevel(level)}
        />
      )}
      {available && level === undefined && (
        <Text variant="body.s">{t("offlineCampaign.finished")}</Text>
      )}
      {pending.length > 0 && (
        <Text variant="body.s">{t("offlineCampaign.awaiting", { count: pending.length })}</Text>
      )}
      {syncBlocked && (
        <Text variant="body.s" accessibilityLiveRegion="polite">
          {t("offlineCampaign.syncBlocked")}
        </Text>
      )}
      {rejected > 0 && (
        <>
          <Text variant="body.s" accessibilityLiveRegion="polite">
            {t("offlineCampaign.rejected", { count: rejected })}
          </Text>
          <Button label={t("common.close")} onPress={clearRejections} />
        </>
      )}
    </View>
  );
};

export default OfflineCampaignPanel;
