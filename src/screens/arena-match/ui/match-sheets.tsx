import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Sheet } from "@shared/ui/sheet";

import { styles } from "./arena-match-styles";

interface IMatchSheets {
  isMenuOpen: boolean;
  isSurrenderOpen: boolean;
  surrenderLoss: number;
  isFriendly: boolean;
  onSurrenderOpen: () => void;
  onSurrender: () => void;
  onClose: () => void;
}

const MatchSheets = ({
  isMenuOpen,
  isSurrenderOpen,
  surrenderLoss,
  isFriendly,
  onSurrenderOpen,
  onSurrender,
  onClose,
}: IMatchSheets) => {
  const { t } = useTranslation();

  return (
    <>
      <Sheet isOpen={isMenuOpen} onDismiss={onClose}>
        <View style={styles.menu}>
          <Button
            testID="match-surrender"
            label={t("match.surrender.action")}
            variant="danger"
            onPress={onSurrenderOpen}
          />
        </View>
      </Sheet>
      <Dialog
        isOpen={isSurrenderOpen}
        title={
          isFriendly
            ? t("match.surrender.confirmFriendly")
            : t("match.surrender.confirm", { count: surrenderLoss })
        }
        onCancel={onClose}
        actions={[
          { label: t("match.surrender.cancel"), variant: "secondary", onPress: onClose },
          { label: t("match.surrender.action"), variant: "danger", onPress: onSurrender },
        ]}
      />
    </>
  );
};

export default MatchSheets;
