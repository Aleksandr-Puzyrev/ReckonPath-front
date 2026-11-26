import { useTranslation } from "react-i18next";

import type { components } from "@shared/api";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

const CompetitionReward = ({ reward }: { reward: components["schemas"]["CompetitionReward"] }) => {
  const { t, i18n } = useTranslation();
  const amount = (value: number) => formatNumber(value, i18n.language);
  const parts = [
    reward.coins > 0 ? t("competition.coins", { value: amount(reward.coins) }) : null,
    reward.gems > 0 ? t("competition.gems", { value: amount(reward.gems) }) : null,
    reward.xp > 0 ? t("competition.xp", { value: amount(reward.xp) }) : null,
    reward.item ? t("competition.item") : null,
  ].filter(Boolean);
  return parts.length > 0 ? <Text variant="body.s">{parts.join(" · ")}</Text> : null;
};

export default CompetitionReward;
