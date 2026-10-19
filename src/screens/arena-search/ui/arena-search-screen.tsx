import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { useArenaSearch } from "../model/use-arena-search";

import { styles } from "./arena-search-styles";
import SearchBody from "./search-body";

const ArenaSearchScreen = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const search = useArenaSearch(showToast);
  const isSearching = search.phase === "searching";
  const { handleCancel } = search;

  useEffect(() => {
    if (!isSearching) return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleCancel();
      return true;
    });
    return () => subscription.remove();
  }, [isSearching, handleCancel]);

  return (
    <Screen style={styles.screen}>
      <SearchBody search={search} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaSearchScreen;
