import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { OfferView } from "@entities/item";
import { Button } from "@shared/ui/button";

import { styles } from "./preview-actions-styles";
import PreviewMainAction from "./preview-main-action";

interface IPreviewActions {
  view: OfferView;
  isOnline: boolean;
  isPending: boolean;
  isShort: boolean;
  onBuy: () => void;
  onEquip: () => void;
  onClose: () => void;
}

const PreviewActions = ({ onClose, ...main }: IPreviewActions) => {
  const { t } = useTranslation();

  return (
    <View style={styles.actions}>
      <View style={styles.close}>
        <Button label={t("common.close")} onPress={onClose} size="l" isDisabled={main.isPending} />
      </View>
      <View style={styles.main}>
        <PreviewMainAction {...main} />
      </View>
    </View>
  );
};

export default PreviewActions;
