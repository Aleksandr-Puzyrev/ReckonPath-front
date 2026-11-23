import type { PlayerProfile } from "@entities/player";

import type { usePlayerProfileScreen } from "../model/use-player-profile-screen";

import HeadToHeadCard from "./head-to-head-card";
import PlayerHero from "./player-hero";
import PlayerMainAction from "./player-main-action";
import PlayerStats from "./player-stats";

interface IPlayerProfileBody {
  profile: PlayerProfile;
  screen: ReturnType<typeof usePlayerProfileScreen>;
}

// A blocked player shows no head to head: the server drops it (у заблокированного игрока нет личных встреч: сервер их не присылает).
const PlayerProfileBody = ({ profile, screen }: IPlayerProfileBody) => (
  <>
    <PlayerHero profile={profile} />
    {profile.relation === "blocked" ? null : (
      <HeadToHeadCard profile={profile} now={screen.openedAt} />
    )}
    <PlayerStats stats={profile.stats} />
    <PlayerMainAction
      profile={profile}
      isDisabled={screen.isDisabled}
      challengeLockReason={screen.challengeLockReason}
      onSend={screen.handleSend}
      onChallenge={screen.handleChallenge}
      onUnblock={screen.handleUnblock}
    />
  </>
);

export default PlayerProfileBody;
