import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";

import { styles } from "./arena-map-styles";

interface IEditorFooter {
  isValid: boolean;
  isOnline: boolean;
  canSave: boolean;
  onCheck: () => void;
  onSave: () => void;
}

const EditorFooter = ({ isValid, isOnline, canSave, onCheck, onSave }: IEditorFooter) => {
  const { t } = useTranslation();

  return (
    <View style={styles.footer}>
      <Button
        testID="editor-check-button"
        label={t("map.check")}
        variant="secondary"
        isDisabled={!isValid}
        onPress={onCheck}
      />
      <View style={styles.footerMain}>
        <Button
          testID="editor-save-big"
          label={isValid ? t("map.saveMap") : t("map.saveDraft")}
          isDisabled={!canSave}
          caption={isOnline ? undefined : t("arena.needInternet")}
          onPress={onSave}
        />
      </View>
    </View>
  );
};

export default EditorFooter;
