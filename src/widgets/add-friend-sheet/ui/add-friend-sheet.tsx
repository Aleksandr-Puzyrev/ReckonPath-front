import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { canRedeemInvite } from "@entities/friend";
import type { FoundPlayer } from "@entities/friend";
import { NICKNAME_MAX_LENGTH } from "@entities/wallet";
import { MyInviteCode, RedeemInviteForm } from "@features/invite-code";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { useAddFriendSheet } from "../model/use-add-friend-sheet";

import { styles } from "./add-friend-sheet-styles";
import SearchResults from "./search-results";

interface IAddFriendSheet {
  isOpen: boolean;
  isOnline: boolean;
  onToast: (text: string) => void;
  onClose: () => void;
  onOpenProfile: (player: FoundPlayer) => void;
}

const AddFriendSheet = ({ isOpen, isOnline, onToast, onClose, onOpenProfile }: IAddFriendSheet) => {
  const { t } = useTranslation();
  const sheet = useAddFriendSheet(onToast);

  return (
    <Sheet
      isOpen={isOpen}
      isScrollable
      onDismiss={() => {
        sheet.handleReset();
        onClose();
      }}
    >
      <View style={styles.sheet}>
        <Text variant="title.l" accessibilityRole="header">
          {t("friends.addFriend")}
        </Text>
        <TextField
          testID="friend-search"
          label={t("nick.title")}
          maxLength={NICKNAME_MAX_LENGTH}
          isInSheet
          value={sheet.text}
          onChangeText={sheet.handleTextChange}
        />
        <SearchResults
          isSearching={sheet.isSearching}
          players={sheet.players}
          errorKey={sheet.errorKey}
          pendingUserId={sheet.pendingUserId}
          isDisabled={!isOnline}
          onSend={sheet.handleSend}
          onOpenProfile={onOpenProfile}
        />
        {sheet.invite === undefined ? null : <MyInviteCode invite={sheet.invite} />}
        {canRedeemInvite(sheet.invite) ? (
          <RedeemInviteForm
            isDisabled={!isOnline}
            onRedeemed={(name) =>
              onToast(
                name === null ? t("friends.redeemAccepted") : t("friends.redeemDone", { name }),
              )
            }
            onError={(messageKey) => onToast(t(messageKey))}
          />
        ) : null}
      </View>
    </Sheet>
  );
};

export default AddFriendSheet;
