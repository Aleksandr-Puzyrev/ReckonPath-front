const HUNDRED = 100;

export const formatPercent = (percent: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "percent" }).format(percent / HUNDRED);
