import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useCompetitionAvailable } from "@entities/competition";
import { PREVIEW_LEVEL } from "@entities/level";
import { AccountGate } from "@features/link-account";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { AchievementList } from "@widgets/achievements";
import { BoardTryout } from "@widgets/board";
import { CollectionGrid, SlotSheet } from "@widgets/collection";
import { EarnSheet } from "@widgets/earn-sheet";
import { ProfileFriendsRow } from "@widgets/profile-friends-row";
import { TopBar } from "@widgets/top-bar";

import { NICKNAME_CHANGED_NOTICE } from "../model/profile-notice";
import { useProfileScreen } from "../model/use-profile-screen";

import CampaignStats from "./campaign-stats";
import ProfileHeader from "./profile-header";
import ProfileStatus from "./profile-status";
import { styles } from "./profile-screen-styles";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { theme, rt } = useUnistyles();
  const profile = useProfileScreen();
  const competitionAvailable = useCompetitionAvailable();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  // The nickname screen reports its result through the route, since it has closed by then (экран ника сообщает результат через маршрут, потому что к этому моменту уже закрыт).
  const noticeToast = notice === NICKNAME_CHANGED_NOTICE ? { id: 0, text: t("nick.saved") } : null;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={profile.handleWalletPress} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {profile.isGuest ? (
          <>
            <ProfileHeader nickname={t("settings.account.guest")} progress={null} />
            <AccountGate
              title={t("profile.saveProgress")}
              body={t("profile.guestNote")}
              onSignUp={() => router.push("/account/sign-up")}
              onSignIn={() => router.push("/account/sign-in")}
            />
          </>
        ) : null}
        {!profile.isGuest && profile.me === undefined ? (
          <ProfileStatus
            isPending={profile.isPending}
            isOnline={profile.isOnline}
            onRetry={profile.handleRetry}
          />
        ) : null}
        {profile.isGuest || profile.me === undefined ? null : (
          <>
            <ProfileHeader
              nickname={profile.me.nickname}
              progress={profile.me}
              avatar={
                profile.inventory.find(
                  ({ itemId, slot }) => slot === "avatar" && itemId === profile.loadout.avatar,
                )?.item.profileTextures
              }
              frame={
                profile.inventory.find(
                  ({ itemId, slot }) => slot === "frame" && itemId === profile.loadout.frame,
                )?.item.profileTextures
              }
              onNicknamePress={() => router.push("/profile/nickname")}
            />
            {competitionAvailable && <CampaignStats />}
            {profile.friendCounts === undefined ? null : (
              <ProfileFriendsRow
                counts={profile.friendCounts}
                onPress={() => router.push("/friends")}
              />
            )}
            <Text variant="eyebrow" style={styles.section}>
              {t("profile.collection")}
            </Text>
            <CollectionGrid
              loadout={profile.loadout}
              inventory={profile.inventory}
              onSlotPress={profile.handleSlotPress}
            />
          </>
        )}
        {!profile.isGuest && competitionAvailable && <AchievementList />}
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
        loadout={profile.loadout}
        inventory={profile.inventory}
        isOnline={profile.isOnline}
        renderBoard={(item) =>
          PREVIEW_LEVEL === undefined ? null : (
            <BoardTryout
              level={PREVIEW_LEVEL}
              size={theme.sizes.shop.previewVisual}
              look={{
                packageUrl: item?.skinUrl ?? null,
                theme: rt.themeName === "light" ? "light" : "dark",
                ...(item?.skin === undefined ? {} : { skin: item.skin }),
              }}
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
      <Toast
        message={toast ?? noticeToast}
        onHide={() => {
          setToast(null);
          router.setParams({ notice: undefined });
        }}
      />
    </Screen>
  );
};

export default ProfileScreen;
