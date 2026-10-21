import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { PREVIEW_LEVEL } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardTryout } from "@widgets/board";
import { CollectionGrid, SlotSheet } from "@widgets/collection";
import { EarnSheet } from "@widgets/earn-sheet";
import { TopBar } from "@widgets/top-bar";

import { useProfileScreen } from "../model/use-profile-screen";

import GuestCard from "./guest-card";
import ProfileHeader from "./profile-header";
import ProfileStatus from "./profile-status";
import { styles } from "./profile-screen-styles";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { theme, rt } = useUnistyles();
  const profile = useProfileScreen();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={profile.handleWalletPress} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {profile.me === undefined ? (
          <ProfileStatus
            isPending={profile.isPending}
            isOnline={profile.isOnline}
            onRetry={profile.handleRetry}
          />
        ) : (
          <>
            <ProfileHeader
              nickname={profile.me.nickname}
              level={profile.me.level}
              xp={profile.me.xp}
              xpToNext={profile.me.xpToNext}
              isGuest={profile.me.isGuest}
            />
            {profile.me.isGuest ? (
              <GuestCard
                onSignUp={() => router.push("/account/sign-up")}
                onSignIn={() => router.push("/account/sign-in")}
              />
            ) : null}
            <Text variant="eyebrow" style={styles.section}>
              {t("profile.collection")}
            </Text>
            <CollectionGrid
              loadout={profile.me.loadout}
              inventory={profile.inventory}
              onSlotPress={profile.handleSlotPress}
            />
          </>
        )}
        <Button
          testID="profile-settings"
          label={t("settings.title")}
          variant="secondary"
          size="l"
          onPress={() => router.push("/settings")}
        />
      </ScrollView>
      <SlotSheet
        slot={profile.slot}
        loadout={profile.me?.loadout ?? {}}
        inventory={profile.inventory}
        isOnline={profile.isOnline}
        renderBoard={(packageUrl) =>
          PREVIEW_LEVEL === undefined ? null : (
            <BoardTryout
              level={PREVIEW_LEVEL}
              size={theme.sizes.shop.previewVisual}
              look={{ packageUrl, theme: rt.themeName === "light" ? "light" : "dark" }}
            />
          )
        }
        onOpenShop={() => {
          profile.handleSlotClose();
          router.push("/shop");
        }}
        onToast={showToast}
        onClose={profile.handleSlotClose}
      />
      <EarnSheet
        isOpen={profile.isEarnOpen}
        shortBy={null}
        onDaily={() => {
          profile.handleEarnClose();
          router.push("/daily");
        }}
        onMessage={(messageKey) => showToast(t(messageKey))}
        onClose={profile.handleEarnClose}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ProfileScreen;
