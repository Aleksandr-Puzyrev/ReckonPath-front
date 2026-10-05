export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale).format(value);
