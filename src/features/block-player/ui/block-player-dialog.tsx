import { useTranslation } from "react-i18next";

import { Dialog } from "@shared/ui/dialog";

import type { useBlockPlayer } from "../model/use-block-player";

interface IBlockPlayerDialog {
  block: ReturnType<typeof useBlockPlayer>;
}

const BlockPlayerDialog = ({ block }: IBlockPlayerDialog) => {
  const { t } = useTranslation();

  return (
    <Dialog
      isOpen={block.confirming !== null}
      title={t("block.confirmTitle", { name: block.confirming?.name ?? "" })}
      message={t("block.confirmBody")}
      onCancel={block.cancel}
      actions={[
        { label: t("common.cancel"), variant: "secondary", onPress: block.cancel },
        {
          label: t("block.action"),
          variant: "danger",
          onPress: block.confirm,
          testID: "block-confirm",
        },
      ]}
    />
  );
};

export default BlockPlayerDialog;
