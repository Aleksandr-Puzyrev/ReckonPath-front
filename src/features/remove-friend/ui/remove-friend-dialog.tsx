import { useTranslation } from "react-i18next";

import { Dialog } from "@shared/ui/dialog";

import type { useRemoveFriend } from "../model/use-remove-friend";

interface IRemoveFriendDialog {
  remove: ReturnType<typeof useRemoveFriend>;
}

const RemoveFriendDialog = ({ remove }: IRemoveFriendDialog) => {
  const { t } = useTranslation();

  return (
    <Dialog
      isOpen={remove.confirming !== null}
      title={t("friends.removeConfirm", { name: remove.confirming?.name ?? "" })}
      onCancel={remove.cancel}
      actions={[
        { label: t("common.cancel"), variant: "secondary", onPress: remove.cancel },
        {
          label: t("friends.remove"),
          variant: "danger",
          onPress: remove.confirm,
          testID: "friend-remove-confirm",
        },
      ]}
    />
  );
};

export default RemoveFriendDialog;
