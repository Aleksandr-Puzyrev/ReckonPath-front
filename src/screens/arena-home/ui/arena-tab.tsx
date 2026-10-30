import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AccountGate } from "@features/link-account";
import { useAccountStore } from "@entities/session";
import { Screen } from "@shared/ui/screen";
import { TopBar } from "@widgets/top-bar";

import ArenaHomeScreen from "./arena-home-screen";
import { styles } from "./arena-home-styles";

const ArenaTab = () => {
  const { t } = useTranslation();
  const hasLogin = useAccountStore((state) => state.hasLogin);

  if (hasLogin) return <ArenaHomeScreen />;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar />
      </View>
      <View style={styles.content}>
        <AccountGate
          title={t("account.gate.arenaTitle")}
          body={t("account.gate.arenaBody")}
          onSignUp={() => router.push("/account/sign-up")}
          onSignIn={() => router.push("/account/sign-in")}
        />
      </View>
    </Screen>
  );
};

export default ArenaTab;
