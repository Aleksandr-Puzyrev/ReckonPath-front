import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./guest-card-styles";

interface IGuestCard {
  onSignUp: () => void;
  onSignIn: () => void;
}

const GuestCard = ({ onSignUp, onSignIn }: IGuestCard) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Text variant="title.m">{t("profile.saveProgress")}</Text>
      <Text variant="body.s" style={styles.note}>
        {t("profile.guestNote")}
      </Text>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            testID="guest-sign-up"
            label={t("account.signUpAction")}
            onPress={onSignUp}
            variant="primary"
          />
        </View>
        <View style={styles.action}>
          <Button testID="guest-sign-in" label={t("account.signInAction")} onPress={onSignIn} />
        </View>
      </View>
    </View>
  );
};

export default GuestCard;
