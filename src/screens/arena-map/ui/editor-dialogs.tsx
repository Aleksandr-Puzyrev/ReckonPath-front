import { useTranslation } from "react-i18next";

import { Dialog } from "@shared/ui/dialog";

import type { EditorDialog } from "../model/use-map-editor";

import RenameDialog from "./rename-dialog";

interface IEditorDialogs {
  dialog: EditorDialog;
  name: string;
  onRandomConfirm: () => void;
  onExitSave: () => void;
  onExitDiscard: () => void;
  onRename: (name: string) => void;
  onClose: () => void;
}

const EditorDialogs = ({
  dialog,
  name,
  onRandomConfirm,
  onExitSave,
  onExitDiscard,
  onRename,
  onClose,
}: IEditorDialogs) => {
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        isOpen={dialog === "random"}
        title={t("map.random.confirm")}
        message={t("map.random.message")}
        onCancel={onClose}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: onClose },
          { label: t("map.random.replace"), variant: "primary", onPress: onRandomConfirm },
        ]}
      />
      <Dialog
        isOpen={dialog === "exit"}
        title={t("map.unsaved")}
        message={t("map.unsavedMessage")}
        onCancel={onClose}
        actions={[
          { label: t("common.cancel"), variant: "ghost", onPress: onClose },
          { label: t("map.dontSave"), variant: "secondary", onPress: onExitDiscard },
          { label: t("map.save"), variant: "primary", onPress: onExitSave },
        ]}
      />
      {dialog === "rename" ? (
        <RenameDialog isOpen name={name} onRename={onRename} onCancel={onClose} />
      ) : null}
    </>
  );
};

export default EditorDialogs;
