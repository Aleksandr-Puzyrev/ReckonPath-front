import { useTranslation } from "react-i18next";
import { Linking } from "react-native";

import { useSystemState } from "@entities/app-config";
import { Button } from "@shared/ui/button";

import UpdateIcon from "@assets/icons/system/update.svg";

import SystemMessage from "./system-message";

const UpdateScreen = () => {
  const { t } = useTranslation();
  const { state } = useSystemState();
  const storeUrl = state.kind === "forcedUpdate" ? state.storeUrl : null;
  const message = state.kind === "forcedUpdate" ? state.message : null;

  return (
    <SystemMessage
      tone="accent"
      Icon={UpdateIcon}
      title={t("system.update.title")}
      body={message ?? t("system.update.body")}
    >
      {storeUrl === null ? null : (
        <Button
          label={t("system.update.cta")}
          onPress={() => Linking.openURL(storeUrl)}
          variant="primary"
          size="l"
        />
      )}
    </SystemMessage>
  );
};

export default UpdateScreen;
