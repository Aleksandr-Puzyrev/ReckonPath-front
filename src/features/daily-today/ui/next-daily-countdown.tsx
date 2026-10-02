import { useTranslation } from "react-i18next";
import type { StyleProp, TextStyle } from "react-native";

import { formatCountdown } from "@shared/lib";
import { Text } from "@shared/ui/text";
import type { TypographyVariant } from "@shared/theme";

import { useMsUntilNextDay } from "../model/use-daily-today";

interface INextDailyCountdown {
  textKey: "daily.next" | "daily.nextShort";
  variant: TypographyVariant;
  style?: StyleProp<TextStyle>;
}

const NextDailyCountdown = ({ textKey, variant, style }: INextDailyCountdown) => {
  const { t } = useTranslation();
  const msUntilNext = useMsUntilNextDay();

  return (
    <Text variant={variant} style={style}>
      {t(textKey, { time: formatCountdown(msUntilNext) })}
    </Text>
  );
};

export default NextDailyCountdown;
