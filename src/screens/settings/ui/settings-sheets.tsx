import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { BoardDemo } from "@widgets/board";
import { RuleCardModal } from "@widgets/rule-card";
import { RulesSheet } from "@widgets/rules-list";
import { SupportSheet } from "@features/contact-support";
import { DeleteAccountSheet } from "@features/delete-account";
import { LinkSheet } from "@features/link-account";
import { RULE_DEMOS } from "@entities/rules";
import type { RuleCardId } from "@entities/rules";

import type { useSettingsScreen } from "../model/use-settings-screen";

import DeletionSummary from "./deletion-summary";

interface ISettingsSheets {
  screen: ReturnType<typeof useSettingsScreen>;
  onToast: (text: string) => void;
}

const SettingsSheets = ({ screen, onToast }: ISettingsSheets) => {
  const { t } = useTranslation();
  const { rt, theme } = useUnistyles();
  const demoSize =
    Math.min(rt.screen.width, theme.sizes.contentMaxWidth) * theme.sizes.ruleCard.demoShare;
  const close = () => screen.handleSheet(null);
  const openForm = (route: "/account/sign-up" | "/account/sign-in") => {
    close();
    router.push(route);
  };

  const renderDemo = (id: RuleCardId) => {
    const demo = RULE_DEMOS[id];
    return (
      <BoardDemo
        level={demo.level}
        taps={demo.taps}
        flags={demo.flags}
        highlight={demo.highlight}
        size={demoSize}
      />
    );
  };

  return (
    <>
      <LinkSheet
        isOpen={screen.sheet === "link"}
        onSignUp={() => openForm("/account/sign-up")}
        onSignIn={() => openForm("/account/sign-in")}
        onLater={close}
      />
      <SupportSheet
        isOpen={screen.sheet === "support"}
        topic="support"
        title={t("settings.support")}
        onSent={() => {
          close();
          onToast(t("system.appeal.sent"));
        }}
        onError={screen.handleError}
        onClose={close}
      />
      <RulesSheet
        isOpen={screen.sheet === "rules"}
        cards={screen.ruleCards}
        onOpenCard={screen.handleRuleOpen}
        onClose={close}
      />
      {screen.ruleIndex === null ? null : (
        <RuleCardModal
          cards={screen.ruleCards}
          initialIndex={screen.ruleIndex}
          isBrowsable
          renderDemo={renderDemo}
          onClose={screen.handleRuleClose}
        />
      )}
      <DeleteAccountSheet
        isOpen={screen.sheet === "delete"}
        nickname={screen.me?.nickname ?? ""}
        summary={<DeletionSummary />}
        onScheduled={() => {
          close();
          screen.handleDeletion();
        }}
        onError={screen.handleError}
        onClose={close}
      />
    </>
  );
};

export default SettingsSheets;
