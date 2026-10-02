import { useSettingsStore } from "./settings-store";

const store = () => useSettingsStore.getState();

describe("useSettingsStore", () => {
  beforeEach(() => store().reset());

  test("starts with sound and vibration on and music off", () => {
    expect(store()).toMatchObject({ isSoundOn: true, isMusicOn: false, isVibrationOn: true });
  });

  test("toggles each setting", () => {
    store().toggleSound();
    store().toggleMusic();
    store().toggleVibration();
    expect(store()).toMatchObject({ isSoundOn: false, isMusicOn: true, isVibrationOn: false });
  });

  test("falls back to the defaults on corrupt data", () => {
    const { migrate } = useSettingsStore.persist.getOptions();
    expect(migrate?.({ isSoundOn: "yes" }, 0)).toEqual({
      isSoundOn: true,
      isMusicOn: false,
      isVibrationOn: true,
    });
  });
});
