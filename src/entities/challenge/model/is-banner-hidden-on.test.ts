import { isBannerHiddenOn } from "./is-banner-hidden-on";

describe("isBannerHiddenOn", () => {
  test("hides the banner in a game, the tryout and the screens of a match (decision 0062 #23)", () => {
    expect(isBannerHiddenOn(["play", "[mode]", "[id]"])).toBe(true);
    expect(isBannerHiddenOn(["play", "code"])).toBe(true);
    expect(isBannerHiddenOn(["editor", "tryout"])).toBe(true);
    expect(isBannerHiddenOn(["arena", "match", "[id]"])).toBe(true);
    expect(isBannerHiddenOn(["arena", "search"])).toBe(true);
    expect(isBannerHiddenOn(["arena", "onboarding"])).toBe(true);
  });

  test("shows the banner on the tabs, the friends, the editor and the arena result", () => {
    expect(isBannerHiddenOn(["(tabs)", "arena"])).toBe(false);
    expect(isBannerHiddenOn(["friends"])).toBe(false);
    expect(isBannerHiddenOn(["editor", "[id]"])).toBe(false);
    expect(isBannerHiddenOn(["arena", "result", "[id]"])).toBe(false);
    expect(isBannerHiddenOn([])).toBe(false);
  });
});
