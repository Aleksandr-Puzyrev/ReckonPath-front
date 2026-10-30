import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, ScrollView, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { LinkSheet } from "@features/link-account";
import { levelOfDraft, NEW_LEVEL_ID } from "@entities/custom-level";
import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardEditor } from "@widgets/board";
import { EditorHeader, StatusLine } from "@widgets/editor-kit";

import { levelStatusTextOf } from "../model/level-status-text";
import { useLevelEditor } from "../model/use-level-editor";

import LevelEditorStatus from "./level-editor-status";
import { styles } from "./level-editor-styles";
import LevelParams from "./level-params";
import LevelTools from "./level-tools";
import ShareLevelSheet from "./share-level-sheet";

const LevelEditorScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { id = NEW_LEVEL_ID } = useLocalSearchParams<{ id: string }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const editor = useLevelEditor(id, showToast);
  const onBack = editor.isReady ? editor.handleBack : null;

  useEffect(() => {
    if (onBack === null) return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  if (!editor.isReady) {
    return (
      <LevelEditorStatus
        isPending={editor.isPending}
        isFailed={editor.isFailed}
        onRetry={editor.handleRetry}
        onLeave={editor.handleLeave}
      />
    );
  }

  const { draft } = editor;
  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardWidth(nativeEvent.layout.width);

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <EditorHeader
          name={draft.title}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          canSave={editor.canSave}
          onBack={editor.handleBack}
          onUndo={editor.handleUndo}
          onRedo={editor.handleRedo}
          onSave={editor.handleSave}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <LevelParams
          title={draft.title}
          params={draft.params}
          moveLimit={editor.moveLimit}
          norm={editor.norm}
          isLimitLow={editor.isLimitLow}
          onTitle={editor.handleTitle}
          onParams={editor.handleParams}
          onMoveLimit={editor.handleMoveLimit}
        />
        <Text variant="caption" style={styles.secondary}>
          {t(`map.hints.${editor.tool}`)}
        </Text>
        <View testID="editor-board-area" style={styles.boardArea} onLayout={handleLayout}>
          {boardWidth > 0 ? (
            <BoardEditor
              level={levelOfDraft(draft, editor.savedId, editor.norm)}
              size={boardWidth - theme.sizes.arena.coordinates}
              fx={editor.fx}
              gesture={editor.gesture}
              taps={[]}
              errors={editor.errorCells}
              onStrokeStart={editor.handleStrokeStart}
              onStrokeCell={editor.handleStrokeCell}
              onStrokeEdge={editor.handleStrokeEdge}
              onStrokeEnd={editor.handleStrokeEnd}
            />
          ) : null}
        </View>
        <StatusLine
          text={levelStatusTextOf(editor.status, t)}
          isValid={editor.status.kind === "valid"}
        />
        <LevelTools tool={editor.tool} onSelect={editor.handleToolSelect} />
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              testID="editor-tryout"
              label={t("editor.tryout")}
              variant="secondary"
              size="l"
              isDisabled={!editor.canTryout}
              onPress={editor.handleTryout}
            />
          </View>
          <View style={styles.action}>
            <Button
              testID="editor-share"
              label={t("code.share.open")}
              variant="secondary"
              size="l"
              isDisabled={!editor.canShare}
              onPress={editor.handleShare}
            />
          </View>
        </View>
      </ScrollView>
      <Dialog
        isOpen={editor.dialog === "unsaved"}
        title={t("map.unsaved")}
        message={t("map.unsavedMessage")}
        onCancel={editor.handleDialogClose}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: editor.handleDialogClose },
          { label: t("map.dontSave"), variant: "danger", onPress: editor.handleDiscard },
        ]}
      />
      <ShareLevelSheet
        isOpen={editor.dialog === "share"}
        level={editor.shareLevel}
        onToast={showToast}
        onClose={editor.handleDialogClose}
      />
      <LinkSheet
        isOpen={editor.dialog === "link"}
        onSignUp={() => editor.handleAccountForm("/account/sign-up")}
        onSignIn={() => editor.handleAccountForm("/account/sign-in")}
        onLater={editor.handleDialogClose}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default LevelEditorScreen;
