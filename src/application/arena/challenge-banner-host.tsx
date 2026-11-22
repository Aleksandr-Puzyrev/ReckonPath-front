import { useSegments } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";

import { ChallengeBanner } from "@widgets/challenge-banner";
import { useArenaAccess } from "@features/arena-access";
import { isBannerHiddenOn } from "@entities/challenge";
import { useIsOnline } from "@shared/api";
import { HAS_ARENA_SERVER } from "@shared/config";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

const ChallengeBannerHost = () => {
  const segments = useSegments();
  const isOnline = useIsOnline();
  const { isUnlocked, isBanned } = useArenaAccess();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const isHidden =
    !HAS_ARENA_SERVER || !isOnline || !isUnlocked || isBanned || isBannerHiddenOn(segments);

  const content = (
    <>
      <ChallengeBanner
        isHidden={isHidden}
        onToast={(text) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }))}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </>
  );

  // On iOS a full-screen modal (the arena result) covers views of the root, so the banner lives in its own window (на iOS полноэкранная модалка — результат арены — перекрывает представления корня, поэтому плашка живёт в отдельном окне).
  return Platform.OS === "ios" ? <FullWindowOverlay>{content}</FullWindowOverlay> : content;
};

export default ChallengeBannerHost;
