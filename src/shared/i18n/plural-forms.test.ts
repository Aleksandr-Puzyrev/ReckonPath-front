import { i18n } from "./index";

describe("plural forms", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  test.each([
    [1, "Сигнал в 1 шаге"],
    [2, "Сигнал в 2 шагах"],
    [5, "Сигнал в 5 шагах"],
    [21, "Сигнал в 21 шаге"],
  ])("uses the Russian form for %i", (count, expected) => {
    expect(i18n.t("play.panel.distance", { count })).toBe(expected);
  });
});
