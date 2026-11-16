import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useArenaQuery } from "@entities/arena";
import { useInventoryQuery } from "@entities/item";
import { useCampaignQuery } from "@entities/level";
import { useWalletQuery } from "@entities/wallet";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { stepLabelOf } from "@widgets/arena-hero";

import CurrencyAmounts from "./currency-amounts";
import { styles } from "./settings-styles";

interface Line {
  key: string;
  label: string;
  value: ReactNode;
}

const DeletionSummary = () => {
  const { t, i18n } = useTranslation();
  const { data: campaign } = useCampaignQuery();
  const { data: wallet } = useWalletQuery();
  const { data: inventory } = useInventoryQuery();
  const { data: arena } = useArenaQuery();
  const format = (value: number) => formatNumber(value, i18n.language);
  const lines: Line[] = [
    {
      key: "campaign",
      label: t("settings.delete.campaign"),
      value: t("settings.delete.campaignValue", {
        count: campaign?.levelsDone ?? 0,
        stars: format(campaign?.stars ?? 0),
      }),
    },
  ];
  if (wallet !== undefined) {
    lines.push({
      key: "currency",
      label: t("settings.delete.currency"),
      value: <CurrencyAmounts wallet={wallet} />,
    });
  }
  if (inventory !== undefined) {
    lines.push({
      key: "collection",
      label: t("settings.delete.collection"),
      value: t("settings.delete.collectionValue", { count: inventory.items.length }),
    });
  }
  if (arena?.unlocked === true) {
    lines.push({
      key: "arena",
      label: t("settings.delete.arena"),
      value: t("settings.delete.arenaValue", {
        league: stepLabelOf(arena.league),
        count: arena.trophies,
      }),
    });
  }

  return (
    <View style={styles.summary}>
      {lines.map((line) => (
        <View key={line.key} style={styles.summaryRow}>
          <Text variant="body.m">{line.label}</Text>
          {typeof line.value === "string" ? (
            <Text variant="body.m" style={styles.value}>
              {line.value}
            </Text>
          ) : (
            line.value
          )}
        </View>
      ))}
    </View>
  );
};

export default DeletionSummary;
