import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { leagueLabelOf } from "@widgets/arena-hero";

import { TUTORIAL_TOOLS } from "../model/editor-tutorial";
import type { ReadyMapEditor } from "../model/use-map-editor";

import { styles } from "./arena-map-styles";
import EditorBoard from "./editor-board";
import StatusLine from "./status-line";
import ToolTile from "./tool-tile";

interface ITutorialEditor {
  editor: ReadyMapEditor;
  canSave: boolean;
}

const TutorialEditor = ({ editor, canSave }: ITutorialEditor) => {
  const { t } = useTranslation();
  const { session, format, counts, limits, profile } = editor;
  const steps = [
    { key: "targets", label: t("map.tutorial.stepTarget"), n: counts.targets, max: limits.targets },
    { key: "bombs", label: t("map.tutorial.stepBomb"), n: counts.bombs, max: limits.bombs },
  ];

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tutorialHeader}>
          <Text variant="title.m" accessibilityRole="header">
            {session.name}
          </Text>
          <Text variant="caption" style={styles.secondary}>
            {[
              `${format.size}×${format.size}`,
              profile === undefined ? null : leagueLabelOf(profile.league, profile.division),
            ]
              .filter((part) => part !== null)
              .join(" · ")}
          </Text>
        </View>
        <View style={styles.tutorialSteps}>
          <Text variant="eyebrow" style={styles.link}>
            {t("map.tutorial.subtitle")}
          </Text>
          {steps.map((step) => (
            <View key={step.key} style={styles.hintRow}>
              <Text variant="body.s">{step.label}</Text>
              <Text variant="button.s" style={styles.secondary}>{`${step.n}/${step.max}`}</Text>
            </View>
          ))}
        </View>
        <EditorBoard editor={editor} />
        <StatusLine
          text={editor.tutorialHintKey === null ? editor.statusText : t(editor.tutorialHintKey)}
          isValid={editor.status.kind === "valid"}
        />
        <View style={styles.palette}>
          {TUTORIAL_TOOLS.map((tool) => (
            <View key={tool} style={styles.tutorialTool}>
              <ToolTile
                tool={tool}
                count={tool === "target" ? counts.targets : counts.bombs}
                max={tool === "target" ? limits.targets : limits.bombs}
                isSelected={editor.tool === tool}
                isDisabled={false}
                flashKey={editor.flash.tool === tool ? editor.flash.key : 0}
                onPress={() => editor.handleToolSelect(tool)}
              />
            </View>
          ))}
        </View>
        <Button
          testID="tutorial-save"
          label={t("map.save").toLocaleUpperCase()}
          variant="primary"
          size="l"
          isDisabled={!canSave || editor.status.kind !== "valid"}
          onPress={editor.handleSave}
        />
      </ScrollView>
    </Screen>
  );
};

export default TutorialEditor;
