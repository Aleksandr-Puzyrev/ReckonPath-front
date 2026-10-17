import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";

import VideoIcon from "@assets/icons/play/video.svg";

import type { RestoreAdState } from "../model/use-restore-streak-for-ad";

interface IRestoreAdButton {
  state: Exclude<RestoreAdState, "limit">;
  onPress: () => void;
}

const CAPTIONS = {
  ready: null,
  loading: "ads.loadingHint",
  unavailable: "ads.retryLater",
  offline: "ads.offlineHint",
} as const;

const RestoreAdButton = ({ state, onPress }: IRestoreAdButton) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const isActive = state === "ready" || state === "unavailable";
  const caption = CAPTIONS[state];

  return (
    <Button
      testID="restore-ad"
      label={t("streak.restoreAd")}
      caption={caption === null ? undefined : t(caption)}
      icon={
        <VideoIcon
          width={iconSize}
          height={iconSize}
          color={isActive ? theme.colors.accent.cyan : theme.colors.text.disabled}
        />
      }
      isDisabled={!isActive}
      onPress={onPress}
    />
  );
};

export default RestoreAdButton;
