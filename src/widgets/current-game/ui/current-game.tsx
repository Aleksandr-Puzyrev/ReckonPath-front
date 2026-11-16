import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useCampaignLevelQuery, useCampaignQuery } from "@entities/level";
import type { PublicBoard } from "@entities/level";
import { useIsOnline } from "@shared/api";
import { Text } from "@shared/ui/text";

import { currentGameOf } from "../model/current-game";

import CampaignDoneHero from "./campaign-done-hero";
import { styles } from "./current-game-styles";
import LevelHero from "./level-hero";

interface ICurrentGame {
  renderPreview: (board: PublicBoard, levelNumber: number) => ReactNode;
  onPlay: (levelNumber: number, isResuming: boolean) => void;
  onDaily: () => void;
}

const CurrentGame = ({ renderPreview, onPlay, onDaily }: ICurrentGame) => {
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const { data: overview, isError } = useCampaignQuery();
  const current = overview === undefined ? null : currentGameOf(overview);
  const { data: detail } = useCampaignLevelQuery(
    current?.kind === "level" ? current.level.number : null,
  );

  if (current === null) {
    return isError || !isOnline ? (
      <Text variant="body.s" style={styles.offline} testID="campaign-offline">
        {t("campaign.offline")}
      </Text>
    ) : null;
  }
  if (current.kind === "done") {
    const [first] = current.belowThree;
    return (
      <CampaignDoneHero
        total={current.total}
        belowThree={current.belowThree.length}
        onCollect={() => {
          if (first !== undefined) onPlay(first.number, false);
        }}
        onDaily={onDaily}
      />
    );
  }
  return (
    <LevelHero
      level={current.level}
      world={current.world}
      board={detail?.board ?? null}
      active={current.active}
      renderPreview={renderPreview}
      onPlay={() => onPlay(current.level.number, current.active !== null)}
    />
  );
};

export default CurrentGame;
