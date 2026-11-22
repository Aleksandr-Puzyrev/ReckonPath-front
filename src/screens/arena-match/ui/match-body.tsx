import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { useArenaQuery } from "@entities/arena";
import { DRAW_MAP_ID } from "@entities/arena-map";
import { matchPhaseOf, useServerNow } from "@entities/match";
import type { MatchView } from "@entities/match";
import { Screen } from "@shared/ui/screen";

import { useMatchActions } from "../model/use-match-actions";
import { useMatchEffects } from "../model/use-match-effects";

import { styles } from "./arena-match-styles";
import MatchSheets from "./match-sheets";
import PlayView from "./play-view";
import PrepareView from "./prepare-view";
import VersusView from "./versus-view";
import { styles as versusStyles } from "./versus-styles";

interface IMatchBody {
  view: MatchView;
  onToast: (text: string) => void;
}

type Overlay = "menu" | "surrender" | null;

const MatchBody = ({ view, onToast }: IMatchBody) => {
  const arena = useArenaQuery();
  const now = useServerNow();
  const actions = useMatchActions(onToast);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const phase = matchPhaseOf(view, now);
  useMatchEffects({ view, maxTimeouts: arena.data?.timing.maxTimeouts ?? null, onToast });

  useEffect(() => {
    if (phase === "done") return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setOverlay("surrender");
      return true;
    });
    return () => subscription.remove();
  }, [phase]);

  const sheets = (
    <MatchSheets
      isMenuOpen={overlay === "menu"}
      isSurrenderOpen={overlay === "surrender"}
      surrenderLoss={view.surrenderLoss ?? 0}
      isFriendly={view.friendly === true}
      onSurrenderOpen={() => setOverlay("surrender")}
      onSurrender={() => {
        setOverlay(null);
        actions.surrender(view.id);
      }}
      onClose={() => setOverlay(null)}
    />
  );

  if (phase === "versus") {
    return (
      <Screen style={versusStyles.screen}>
        <VersusView view={view} />
      </Screen>
    );
  }
  return (
    <Screen style={styles.screen}>
      {phase === "prepare" ? (
        <PrepareView
          view={view}
          activeMapId={arena.data?.activeMap?.id ?? null}
          isPending={actions.isPreparing}
          onSaved={(mapId) => actions.chooseMap(view.id, { source: "saved", mapId })}
          onRandom={() => actions.chooseMap(view.id, { source: "random" })}
          onDraw={() =>
            router.push({
              pathname: "/arena/map/[id]",
              params: { id: DRAW_MAP_ID, matchId: view.id },
            })
          }
          onReady={() => actions.ready(view.id)}
          onSurrender={() => setOverlay("surrender")}
        />
      ) : (
        <PlayView view={view} actions={actions} onMenu={() => setOverlay("menu")} />
      )}
      {sheets}
    </Screen>
  );
};

export default MatchBody;
