import { installStoreOf } from "./install-store";

describe("installStoreOf", () => {
  test("takes the App Store on iOS without asking the native module", () => {
    const installer = jest.fn(() => null);

    expect(installStoreOf("ios", installer)).toBe("appStore");
    expect(installer).not.toHaveBeenCalled();
  });

  test("takes RuStore when it installed the app on Android", () => {
    expect(installStoreOf("android", () => "ru.vk.store")).toBe("ruStore");
  });

  test("takes Google Play for any other Android installer", () => {
    expect(installStoreOf("android", () => "com.android.vending")).toBe("playMarket");
    expect(installStoreOf("android", () => null)).toBe("playMarket");
  });
});
