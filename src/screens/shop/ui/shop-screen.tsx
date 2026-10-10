import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { PREVIEW_LEVEL } from "@entities/level";
import { formatClockTime } from "@shared/lib";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardTryout } from "@widgets/board";
import { EarnSheet } from "@widgets/earn-sheet";
import { ItemPreviewSheet } from "@widgets/item-preview";
import { offerKeyOf } from "@entities/item";
import { ProductCard } from "@widgets/shop-grid";
import { TopBar } from "@widgets/top-bar";

import { useShopScreen } from "../model/use-shop-screen";

import ShopHeader from "./shop-header";
import { styles } from "./shop-screen-styles";
import ShopStatus from "./shop-status";

const COLUMNS = 2;

const ShopScreen = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const shop = useShopScreen();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const updatedAtText =
    shop.shop === undefined || shop.isOnline
      ? null
      : t("common.updatedAt", {
          time: formatClockTime(new Date(shop.updatedAt).toISOString(), i18n.language),
        });

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={shop.handleWalletPress} />
      </View>
      <FlashList
        data={shop.cards}
        numColumns={COLUMNS}
        keyExtractor={offerKeyOf}
        extraData={shop.now}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <ShopHeader
            featured={shop.featured}
            now={shop.now}
            tabs={shop.tabs}
            tab={shop.tab}
            isOwnedHidden={shop.isOwnedHidden}
            updatedAtText={updatedAtText}
            onDropOpen={shop.handleDropOpen}
            onTabSelect={shop.handleTabSelect}
            onOwnedToggle={shop.handleOwnedToggle}
          />
        }
        ListEmptyComponent={
          shop.shop === undefined ? (
            <ShopStatus
              isPending={shop.isPending}
              isOnline={shop.isOnline}
              onRetry={shop.handleRetry}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard card={item} now={shop.now} onPress={shop.handleOfferPress} />
          </View>
        )}
      />
      <ItemPreviewSheet
        offer={shop.offer}
        items={shop.items}
        renderBoard={(look) =>
          PREVIEW_LEVEL === undefined ? null : (
            <BoardTryout level={PREVIEW_LEVEL} size={theme.sizes.shop.previewVisual} look={look} />
          )
        }
        now={shop.now}
        isOnline={shop.isOnline}
        onClose={shop.handlePreviewClose}
        onShortOf={shop.handleShortOf}
        onToast={(text) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }))}
      />
      <EarnSheet
        isOpen={shop.isEarnOpen}
        shortBy={shop.shortage?.amount ?? null}
        currency={shop.shortage?.currency}
        onDaily={() => {
          shop.handleEarnClose();
          router.push("/daily");
        }}
        onMessage={(messageKey) =>
          setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }))
        }
        onClose={shop.handleEarnClose}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ShopScreen;
