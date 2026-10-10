import type { TFunction } from "i18next";

import { splitTimeLeft } from "@shared/lib";

const PAD = 2;

const clockOf = (hours: number, minutes: number) =>
  `${String(hours).padStart(PAD, "0")}:${String(minutes).padStart(PAD, "0")}`;

export const formatDropLeft = (t: TFunction, ms: number) => {
  const { days, hours, minutes } = splitTimeLeft(ms);
  return days > 0 ? t("shop.drop.days", { count: days }) : clockOf(hours, minutes);
};

export const formatCardLeft = (t: TFunction, ms: number) => {
  const { days, hours, minutes } = splitTimeLeft(ms);
  if (days === 0) return clockOf(hours, minutes);
  return hours === 0 ? t("shop.timer.days", { days }) : t("shop.timer.daysHours", { days, hours });
};
