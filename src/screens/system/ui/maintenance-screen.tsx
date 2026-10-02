import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Toast } from "@shared/ui/toast";

import WrenchIcon from "@assets/icons/system/wrench.svg";

import { useMaintenanceScreen } from "../model/use-maintenance-screen";

import SystemMessage from "./system-message";

const MaintenanceScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const screen = useMaintenanceScreen();

  return (
    <>
      <SystemMessage
        tone="warning"
        Icon={WrenchIcon}
        title={t("system.maintenance.title")}
        body={screen.body}
      >
        <Button
          label={t("system.maintenance.cta")}
          onPress={screen.handlePlayOffline}
          variant="primary"
          size="l"
        />
        <Button
          label={t(screen.isChecking ? "system.maintenance.checking" : "system.maintenance.retry")}
          onPress={screen.handleCheck}
          isDisabled={screen.isChecking}
          icon={
            screen.isChecking ? <ActivityIndicator color={theme.colors.text.primary} /> : undefined
          }
          size="l"
        />
      </SystemMessage>
      <Toast message={screen.toast} onHide={screen.handleToastHide} />
    </>
  );
};

export default MaintenanceScreen;
