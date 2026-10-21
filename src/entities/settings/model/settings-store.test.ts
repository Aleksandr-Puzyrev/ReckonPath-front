import { useSettingsStore } from "./settings-store";

const store = () => useSettingsStore.getState();

describe("useSettingsStore", () => {
  beforeEach(() => store().reset());

  test("starts with sound at 80, music off and coordinates on (decision 0040 #1, #6)", () => {
    expect(store()).toMatchObject({
      volume: { sound: 80, music: 0 },
      isVibrationOn: true,
      isCoordinatesOn: true,
      isPvpTapConfirmOn: false,
      isRivalSkinsOn: true,
      theme: "system",
      language: null,
    });
  });

  test("turns a channel off and back to its last level", () => {
    store().setVolume("sound", 55);
    store().toggleVolume("sound");
    expect(store().volume.sound).toBe(0);
    store().toggleVolume("sound");

    expect(store().volume.sound).toBe(55);
  });

  test("brings music back to the design level when it was never set", () => {
    store().toggleVolume("music");

    expect(store().volume.music).toBe(40);
  });

  test("keeps the last level when a slider goes down to zero", () => {
    store().setVolume("music", 30);
    store().setVolume("music", 0);
    store().toggleVolume("music");

    expect(store().volume.music).toBe(30);
  });

  test("toggles the switches and sets the theme and the language", () => {
    store().toggleVibration();
    store().toggleCoordinates();
    store().togglePvpTapConfirm();
    store().toggleRivalSkins();
    store().setTheme("light");
    store().setLanguage("en");

    expect(store()).toMatchObject({
      isVibrationOn: false,
      isCoordinatesOn: false,
      isPvpTapConfirmOn: true,
      isRivalSkinsOn: false,
      theme: "light",
      language: "en",
    });
  });

  test("moves the first version's switches to volumes", () => {
    const { migrate } = useSettingsStore.persist.getOptions();

    expect(migrate?.({ isSoundOn: false, isMusicOn: true, isVibrationOn: false }, 1)).toMatchObject(
      {
        volume: { sound: 0, music: 40 },
        isVibrationOn: false,
        theme: "system",
      },
    );
  });

  test("falls back to the defaults on corrupt data", () => {
    const { migrate } = useSettingsStore.persist.getOptions();

    expect(migrate?.({ volume: "loud" }, 2)).toMatchObject({ volume: { sound: 80, music: 0 } });
  });
});
