import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { useArenaSearch } from "../model/use-arena-search";

import { styles } from "./arena-search-styles";
import SearchingView from "./searching-view";

const ArenaSearchScreen = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const search = useArenaSearch(showToast);
  const { handleCancel } = search;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleCancel();
      return true;
    });
    return () => subscription.remove();
  }, [handleCancel]);

  return (
    <Screen style={styles.screen}>
      <SearchingView
        queue={search.queue}
        activeMap={search.activeMap}
        waitedMs={search.waitedMs}
        canPlayMap={search.canPlayMap}
        isLeaving={search.isLeaving}
        onVsMap={search.handleVsMap}
        onCancel={handleCancel}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaSearchScreen;
