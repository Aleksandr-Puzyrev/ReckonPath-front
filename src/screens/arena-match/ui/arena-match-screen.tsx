import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { matchSession, useMatchEvents, useMatchStore } from "@entities/match";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { styles } from "./arena-match-styles";
import MatchBody from "./match-body";

const ArenaMatchScreen = () => {
  useKeepAwake();
  useMatchEvents();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const view = useMatchStore((state) => (state.view?.id === id ? state.view : null));
  const isMissing = view === null;

  // A match opened from the arena home or after a restart is read from the server (матч, открытый с главной арены или после перезапуска, читается с сервера).
  useEffect(() => {
    if (isMissing) void matchSession.refresh();
  }, [isMissing]);

  return (
    <>
      {view === null ? (
        <Screen style={styles.screen}>
          <View style={styles.boardArea} testID="match-loading" accessibilityElementsHidden />
        </Screen>
      ) : (
        <MatchBody view={view} onToast={showToast} />
      )}
      <Toast message={toast} onHide={() => setToast(null)} />
    </>
  );
};

export default ArenaMatchScreen;
