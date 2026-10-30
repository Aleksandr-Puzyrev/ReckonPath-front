import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AccountGate } from "@features/link-account";
import { useAccountStore } from "@entities/session";
import { Screen } from "@shared/ui/screen";
import { TopBar } from "@widgets/top-bar";

import ShopScreen from "./shop-screen";
import { styles } from "./shop-screen-styles";

const ShopTab = () => {
  const { t } = useTranslation();
  const hasLogin = useAccountStore((state) => state.hasLogin);

  if (hasLogin) return <ShopScreen />;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar />
      </View>
      <View style={styles.content}>
        <AccountGate
          title={t("account.gate.shopTitle")}
          body={t("account.gate.shopBody")}
          onSignUp={() => router.push("/account/sign-up")}
          onSignIn={() => router.push("/account/sign-in")}
        />
      </View>
    </Screen>
  );
};

export default ShopTab;
