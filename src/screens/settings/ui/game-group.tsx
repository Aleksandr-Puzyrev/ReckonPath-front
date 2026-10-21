import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore, VOLUME_MAX, VOLUME_STEP } from "@entities/settings";
import { SettingsRow } from "@shared/ui/settings-row";
import { Slider } from "@shared/ui/slider";
import { Toggle } from "@shared/ui/toggle";

import ConfirmIcon from "@assets/icons/settings/confirm.svg";
import CoordinatesIcon from "@assets/icons/settings/coordinates.svg";
import MusicIcon from "@assets/icons/settings/music.svg";
import SkinsIcon from "@assets/icons/settings/skins.svg";
import SoundIcon from "@assets/icons/settings/sound.svg";
import VibrationIcon from "@assets/icons/settings/vibration.svg";

import SettingsGroup from "./settings-group";

const GameGroup = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const settings = useSettingsStore(useShallow((state) => state));
  const { colors } = theme;

  return (
    <SettingsGroup title={t("settings.group.game")}>
      {/* TODO: play sound and music by these levels once the assets exist */}
      <SettingsRow
        Icon={SoundIcon}
        iconColor={colors.accent.cyan}
        label={t("settings.sound")}
        isFirst
      >
        <Slider
          testID="settings-sound"
          label={t("settings.sound")}
          value={settings.volume.sound}
          max={VOLUME_MAX}
          step={VOLUME_STEP}
          onChange={(level) => settings.setVolume("sound", level)}
        />
      </SettingsRow>
      <SettingsRow Icon={MusicIcon} iconColor={colors.accent.blue} label={t("settings.music")}>
        <Slider
          testID="settings-music"
          label={t("settings.music")}
          value={settings.volume.music}
          max={VOLUME_MAX}
          step={VOLUME_STEP}
          onChange={(level) => settings.setVolume("music", level)}
        />
      </SettingsRow>
      <SettingsRow
        Icon={VibrationIcon}
        iconColor={colors.rarity.epic}
        label={t("settings.vibration")}
        accessory={
          <Toggle
            testID="settings-vibration"
            label={t("settings.vibration")}
            isOn={settings.isVibrationOn}
            onToggle={settings.toggleVibration}
          />
        }
      />
      <SettingsRow
        Icon={CoordinatesIcon}
        iconColor={colors.status.success}
        label={t("settings.coordinates")}
        subtitle={t("settings.coordinatesHint")}
        accessory={
          <Toggle
            testID="settings-coordinates"
            label={t("settings.coordinates")}
            isOn={settings.isCoordinatesOn}
            onToggle={settings.toggleCoordinates}
          />
        }
      />
      <SettingsRow
        Icon={ConfirmIcon}
        iconColor={colors.accent.pink}
        label={t("settings.pvpConfirm")}
        subtitle={t("settings.pvpConfirmHint")}
        accessory={
          <Toggle
            testID="settings-pvp-confirm"
            label={t("settings.pvpConfirm")}
            isOn={settings.isPvpTapConfirmOn}
            onToggle={settings.togglePvpTapConfirm}
          />
        }
      />
      <SettingsRow
        Icon={SkinsIcon}
        iconColor={colors.feedback.warm}
        label={t("settings.rivalSkins")}
        subtitle={t("settings.rivalSkinsHint")}
        accessory={
          <Toggle
            testID="settings-rival-skins"
            label={t("settings.rivalSkins")}
            isOn={settings.isRivalSkinsOn}
            onToggle={settings.toggleRivalSkins}
          />
        }
      />
    </SettingsGroup>
  );
};

export default GameGroup;
