import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, ScrollView, View } from "react-native";

import { NEW_MAP_ID } from "@entities/arena-map";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { leagueLabelOf } from "@widgets/arena-hero";

import { useMapEditor } from "../model/use-map-editor";

import { styles } from "./arena-map-styles";
import EditorBoard from "./editor-board";
import EditorDialogs from "./editor-dialogs";
import EditorFooter from "./editor-footer";
import EditorHeader from "./editor-header";
import EditorStatus from "./editor-status";
import StatusLine from "./status-line";
import ToolPalette from "./tool-palette";
import TutorialEditor from "./tutorial-editor";

const ArenaMapScreen = () => {
  const { t } = useTranslation();
  const { id = NEW_MAP_ID } = useLocalSearchParams<{ id: string }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const editor = useMapEditor(id, showToast);
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
      <EditorStatus
        isPending={editor.isPending}
        isFailed={editor.isFailed}
        onRetry={editor.handleRetry}
        onLeave={editor.handleLeave}
      />
    );
  }

  const { session, format, check } = editor;
  const canSave = editor.isOnline && !editor.isSaving;
  if (editor.isTutorial) {
    return (
      <>
        <TutorialEditor editor={editor} canSave={canSave} />
        <Toast message={toast} onHide={() => setToast(null)} />
      </>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <EditorHeader
          name={session.name}
          canUndo={session.past.length > 0}
          canRedo={session.future.length > 0}
          canSave={canSave}
          onBack={editor.handleBack}
          onRename={editor.handleRenameOpen}
          onUndo={editor.handleUndo}
          onRedo={editor.handleRedo}
          onSave={editor.handleSave}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="body.s" style={styles.secondary}>
          {t("arena.maps.format", {
            size: `${format.size}×${format.size}`,
            league:
              editor.profile === undefined
                ? ""
                : leagueLabelOf(editor.profile.league, editor.profile.division),
          })}
        </Text>
        <View style={styles.hintRow}>
          <Text variant="caption" style={styles.secondary}>
            {t(`map.hints.${editor.tool}`)}
          </Text>
          <Text
            variant="button.s"
            style={styles.link}
            accessibilityRole="button"
            onPress={editor.handleClear}
            testID="editor-clear"
          >
            {t("map.clear")}
          </Text>
        </View>
        <EditorBoard editor={editor} />
        <StatusLine text={editor.statusText} isValid={editor.status.kind === "valid"} />
        {check.check === null ? null : (
          <Text variant="body.s" style={styles.secondary} testID="editor-check">
            {check.isDone
              ? t("map.checked", { found: check.check.run.found, count: check.check.run.moves })
              : t("map.checking", { n: check.taps.length })}
          </Text>
        )}
        <ToolPalette
          tool={editor.tool}
          counts={editor.counts}
          limits={editor.limits}
          flash={editor.flash}
          isRandomDisabled={editor.isRandomPending}
          onSelect={editor.handleToolSelect}
          onRandom={editor.handleRandom}
        />
        <EditorFooter
          isValid={editor.status.kind === "valid"}
          isOnline={editor.isOnline}
          canSave={canSave}
          onCheck={editor.handleCheck}
          onSave={editor.handleSave}
        />
      </ScrollView>
      <EditorDialogs
        dialog={editor.dialog}
        name={session.name}
        onRandomConfirm={editor.handleRandomConfirm}
        onExitSave={editor.handleExitSave}
        onExitDiscard={editor.handleExitDiscard}
        onRename={editor.handleRename}
        onClose={editor.handleDialogClose}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaMapScreen;
