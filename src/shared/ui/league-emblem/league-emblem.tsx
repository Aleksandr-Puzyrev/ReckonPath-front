import { View } from "react-native";

import { Text } from "../text";

import { styles } from "./league-emblem-styles";

export type LeagueTone = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master";

interface ILeagueEmblem {
  league: LeagueTone;
  numeral: string;
}

const LeagueEmblem = ({ league, numeral }: ILeagueEmblem) => {
  styles.useVariants({ league });

  return (
    <View style={styles.emblem} importantForAccessibility="no-hide-descendants">
      <Text variant="title.m" style={styles.numeral}>
        {numeral}
      </Text>
    </View>
  );
};

export default LeagueEmblem;
