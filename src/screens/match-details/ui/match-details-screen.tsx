import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useMatchDetailsQuery } from "@entities/match";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import MatchDetailsBody from "./match-details-body";
import { styles } from "./match-details-styles";
import MatchDetailsStatus from "./match-details-status";

const MatchDetailsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, refetch } = useMatchDetailsQuery(id);
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="details-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {data === undefined ? (
          <MatchDetailsStatus isPending={isPending} onRetry={() => void refetch()} />
        ) : (
          <MatchDetailsBody match={data} />
        )}
      </ScrollView>
    </Screen>
  );
};

export default MatchDetailsScreen;
