import type { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import type { GameState } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import type { CampaignLevel } from "@entities/level";
import { useProgressStore } from "@entities/progress";

import { currentGameOf } from "../model/current-game";

import CampaignDoneHero from "./campaign-done-hero";
import LevelHero from "./level-hero";

interface ICurrentGame {
  renderPreview: (campaignLevel: CampaignLevel, game: GameState | null) => ReactNode;
  onPlay: (levelId: string, isResuming: boolean) => void;
  onDaily: () => void;
}

const CurrentGame = ({ renderPreview, onPlay, onDaily }: ICurrentGame) => {
  const best = useProgressStore((state) => state.best);
  const saved = useGameSessionStore(useShallow(({ levelId, actions }) => ({ levelId, actions })));
  const current = currentGameOf(best, saved);

  if (current.kind === "done") {
    const [first] = current.belowThree;
    return (
      <CampaignDoneHero
        total={current.total}
        belowThree={current.belowThree.length}
        onCollect={() => {
          if (first !== undefined) onPlay(first.level.id, false);
        }}
        onDaily={onDaily}
      />
    );
  }
  return (
    <LevelHero
      campaignLevel={current.campaignLevel}
      game={current.game}
      renderPreview={renderPreview}
      onPlay={() => onPlay(current.campaignLevel.level.id, current.game !== null)}
    />
  );
};

export default CurrentGame;
