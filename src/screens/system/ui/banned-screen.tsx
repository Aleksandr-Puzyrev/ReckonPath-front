import { useState } from "react";

import { useBanStore } from "@entities/app-config";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BanNotice } from "@widgets/ban-notice";

import { styles } from "./banned-screen-styles";

const BannedScreen = () => {
  const ban = useBanStore((state) => state.ban);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  return (
    <Screen style={styles.screen}>
      {ban === null ? null : (
        <BanNotice
          ban={ban}
          onCampaign={null}
          onMessage={(text) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }))}
        />
      )}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default BannedScreen;
