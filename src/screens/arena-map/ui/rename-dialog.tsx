import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog } from "@shared/ui/dialog";
import { TextField } from "@shared/ui/text-field";

const MAX_NAME_LENGTH = 20;

interface IRenameDialog {
  isOpen: boolean;
  name: string;
  onRename: (name: string) => void;
  onCancel: () => void;
}

const RenameDialog = ({ isOpen, name, onRename, onCancel }: IRenameDialog) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(name);
  const trimmed = value.trim();

  return (
    <Dialog
      isOpen={isOpen}
      title={t("map.rename")}
      onCancel={onCancel}
      actions={[
        { label: t("common.cancel"), variant: "secondary", onPress: onCancel },
        {
          label: t("map.save"),
          variant: "primary",
          onPress: () => (trimmed === "" ? onCancel() : onRename(trimmed)),
        },
      ]}
    >
      <TextField
        testID="rename-field"
        label={t("map.rename")}
        value={value}
        onChangeText={setValue}
        maxLength={MAX_NAME_LENGTH}
      />
    </Dialog>
  );
};

export default RenameDialog;
