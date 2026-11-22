import { useWaitingExit } from "../model/use-waiting-exit";
import type { WaitingChallenge } from "../model/use-challenge-friend";

import WaitingBody from "./waiting-body";

interface IChallengeWaiting {
  waiting: WaitingChallenge | null;
  onCancel: () => void;
}

// A layer inside the screen, not a native modal: the match screen may be pushed right as it closes (слой внутри экрана, а не нативная модалка: экран матча может открыться в тот же момент, когда он закрывается).
const ChallengeWaiting = ({ waiting, onCancel }: IChallengeWaiting) => {
  useWaitingExit(waiting !== null, onCancel);

  return waiting === null ? null : <WaitingBody waiting={waiting} onCancel={onCancel} />;
};

export default ChallengeWaiting;
