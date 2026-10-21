import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useChangeLanguage } from "@features/change-language";
import { useSignOut } from "@features/sign-out";
import { RULE_DEMOS, isRuleCardId } from "@entities/rules";
import { useAccountStore } from "@entities/session";
import { useMeQuery } from "@entities/wallet";
import type { ErrorMessageKey } from "@shared/api";
import { APP_VERSION } from "@shared/config";
import { i18n } from "@shared/i18n";
import type { AppLanguage } from "@shared/i18n";

export type SettingsSheet = "link" | "support" | "rules" | "delete" | null;

const RULE_CARDS = Object.keys(RULE_DEMOS).filter(isRuleCardId);

export const useSettingsScreen = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const hasLogin = useAccountStore((account) => account.hasLogin);
  const [sheet, setSheet] = useState<SettingsSheet>(null);
  const [ruleIndex, setRuleIndex] = useState<number | null>(null);
  const showError = (messageKey: ErrorMessageKey) => onToast(t(messageKey));
  const changeLanguage = useChangeLanguage(showError);
  const signOut = useSignOut({
    onSignedOut: () => onToast(t("settings.account.signedOut")),
    onError: showError,
  });

  const copyId = async () => {
    if (me === undefined) return;
    await Clipboard.setStringAsync(me.id);
    onToast(t("settings.copied"));
  };

  const rate = async () => {
    try {
      if (await StoreReview.hasAction()) await StoreReview.requestReview();
    } catch {
      onToast(t("errors.generic"));
    }
  };

  return {
    me,
    hasLogin,
    deletionAt: me?.flags.deletionScheduledAt ?? null,
    version: Application.nativeApplicationVersion ?? APP_VERSION,
    build: Application.nativeBuildVersion,
    sheet,
    ruleCards: RULE_CARDS,
    ruleIndex,
    isSigningOut: signOut.isPending,
    handleSheet: setSheet,
    handleRuleOpen: (index: number) => {
      setSheet(null);
      setRuleIndex(index);
    },
    handleRuleClose: () => setRuleIndex(null),
    handleLanguage: (language: AppLanguage) => {
      changeLanguage(language);
      onToast(i18n.getFixedT(language)("settings.language.set"));
    },
    handleSignOut: signOut.signOut,
    handleDeletion: () => router.push("/settings/deletion"),
    handleCopyId: () => void copyId(),
    handleRate: () => void rate(),
    handleError: showError,
  };
};
