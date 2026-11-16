import { useTranslation } from "react-i18next";

import { Text } from "@shared/ui/text";

import { msLeft, useServerNow } from "../model/use-server-now";

interface IPrepareTimer {
  deadline: string;
}

const MS_PER_SECOND = 1000;

const PrepareTimer = ({ deadline }: IPrepareTimer) => {
  const { t } = useTranslation();
  const now = useServerNow();

  return (
    <Text variant="number.counter" testID="prepare-timer" accessibilityLiveRegion="polite">
      {t("prepare.timer", { seconds: Math.ceil(msLeft(deadline, now) / MS_PER_SECOND) })}
    </Text>
  );
};

export default PrepareTimer;
