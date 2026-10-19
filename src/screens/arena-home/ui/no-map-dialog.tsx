import { useTranslation } from "react-i18next";

import { Dialog } from "@shared/ui/dialog";

interface INoMapDialog {
  isOpen: boolean;
  isPending: boolean;
  onBuild: () => void;
  onRandom: () => void;
  onClose: () => void;
}

const NoMapDialog = ({ isOpen, isPending, onBuild, onRandom, onClose }: INoMapDialog) => {
  const { t } = useTranslation();

  return (
    <Dialog
      isOpen={isOpen}
      title={t("search.noMap.title")}
      onCancel={onClose}
      actions={[
        { label: t("arena.createMap"), variant: "secondary", onPress: onBuild },
        {
          label: t("search.noMap.random"),
          variant: "primary",
          onPress: isPending ? () => undefined : onRandom,
        },
      ]}
    />
  );
};

export default NoMapDialog;
