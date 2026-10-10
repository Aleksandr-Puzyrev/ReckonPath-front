import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";

import VideoIcon from "@assets/icons/play/video.svg";

import type { AdButtonState } from "../model/use-continue-for-ad";

interface IAdContinueButton {
  state: Exclude<AdButtonState, "limit">;
  left: number | null;
  onPress: () => void;
}

const LABELS = {
  ready: { label: "ads.watch", caption: null },
  loading: { label: "ads.loading", caption: "ads.loadingHint" },
  unavailable: { label: "ads.unavailableShort", caption: "ads.retryLater" },
  offline: { label: "ads.offline", caption: "ads.offlineHint" },
} as const;

const AdContinueButton = ({ state, left, onPress }: IAdContinueButton) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.l;
  const isActive = state === "ready" || state === "unavailable";
  const { label, caption } = LABELS[state];

  const captionText = () => {
    if (caption !== null) return t(caption);
    return left === null ? undefined : t("result.continue.left", { count: left });
  };

  return (
    <Button
      testID="continue-ad"
      label={t(label)}
      caption={captionText()}
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

export default AdContinueButton;
