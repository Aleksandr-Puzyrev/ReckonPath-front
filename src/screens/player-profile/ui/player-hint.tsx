import { Text } from "@shared/ui/text";

import { styles } from "./player-profile-styles";

interface IPlayerHint {
  text: string;
}

const PlayerHint = ({ text }: IPlayerHint) => (
  <Text variant="body.s" style={styles.message} testID="player-hint">
    {text}
  </Text>
);

export default PlayerHint;
