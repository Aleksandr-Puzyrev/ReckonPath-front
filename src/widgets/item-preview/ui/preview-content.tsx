import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useEquipItem } from "@features/equip-item";
import type { EquipTarget } from "@features/equip-item";
import { usePurchaseItem } from "@features/purchase-item";
import type { EndedReason } from "@features/purchase-item";
import { amountOf, currencyOf, offerKeyOf, offerViewOf } from "@entities/item";
import type { Currency, ShopItem, ShopOffer } from "@entities/item";
import { useWalletQuery } from "@entities/wallet";
import { Dialog } from "@shared/ui/dialog";

import type { PreviewLook } from "../model/preview-look";

import PreviewActions from "./preview-actions";
import { styles } from "./preview-content-styles";
import PreviewDetails from "./preview-details";
import PriceText from "./price-text";
import PurchaseSuccess from "./purchase-success";

interface IPreviewContent {
  offer: ShopOffer;
  items: readonly ShopItem[];
  renderBoard: (look: PreviewLook) => ReactNode;
  now: number;
  isOnline: boolean;
  onClose: () => void;
  onShortOf: (amount: number, currency: Currency) => void;
  onToast: (text: string) => void;
}

// A bundle equips only its first part (decision 0054 #3) (набор надевает только свою первую часть).
const equipTargetOf = (offer: ShopOffer, items: readonly ShopItem[]): EquipTarget | null => {
  if (offer.kind === "item") return offer.item;
  const [first] = offer.bundle.items;
  return items.find(({ id }) => id === first) ?? null;
};

const PreviewContent = ({
  offer,
  items,
  renderBoard,
  now,
  isOnline,
  onClose,
  onShortOf,
  onToast,
}: IPreviewContent) => {
  const { t } = useTranslation();
  const { data: wallet } = useWalletQuery();
  const [isSuccess, setIsSuccess] = useState(false);
  const [ended, setEnded] = useState<EndedReason | null>(null);
  const view = offerViewOf(offer);
  const purchase = usePurchaseItem(offerKeyOf(offer), view.price, {
    onShortOf,
    onPurchased: () => setIsSuccess(true),
    onOwned: () => onToast(t("errors.already_owned")),
    onEnded: setEnded,
    onError: (messageKey) => onToast(t(messageKey)),
  });
  const { equip } = useEquipItem({
    onEquipped: (name) => onToast(t("shop.equippedToast", { item: name })),
    onError: (messageKey) => onToast(t(messageKey)),
  });
  const shownView = { ...view, price: purchase.price };
  const isShort = amountOf(purchase.price) > (wallet?.[currencyOf(purchase.price)] ?? 0);

  const handleEquip = () => {
    setIsSuccess(false);
    const target = equipTargetOf(offer, items);
    if (target === null) {
      onToast(t("errors.generic"));
      return;
    }
    equip(target, view.name);
  };

  const handleEndedClose = () => {
    setEnded(null);
    onClose();
  };

  return (
    <View style={styles.content}>
      {isSuccess ? (
        <PurchaseSuccess view={shownView} canEquip onLater={onClose} onEquip={handleEquip} />
      ) : (
        <>
          <PreviewDetails offer={offer} items={items} renderBoard={renderBoard} now={now} />
          <PreviewActions
            view={shownView}
            isOnline={isOnline}
            isPending={purchase.isPending}
            isShort={isShort}
            onBuy={purchase.handleBuy}
            onEquip={handleEquip}
            onClose={onClose}
          />
        </>
      )}
      <Dialog
        isOpen={purchase.isConfirming}
        title={
          <PriceText
            i18nKey="shop.confirm.title"
            price={purchase.price}
            item={view.name}
            variant="title.m"
          />
        }
        message={
          <PriceText
            i18nKey="shop.confirm.left"
            price={
              currencyOf(purchase.price) === "emeralds"
                ? { emeralds: purchase.balanceAfter }
                : { coins: purchase.balanceAfter }
            }
            variant="body.m"
          />
        }
        onCancel={purchase.handleCancelConfirm}
        actions={[
          {
            label: t("common.cancel"),
            variant: "secondary",
            onPress: purchase.handleCancelConfirm,
          },
          { label: t("shop.confirm.buy"), variant: "primary", onPress: purchase.handleConfirm },
        ]}
      />
      <Dialog
        isOpen={ended !== null}
        title={ended === "sold_out" ? t("shop.soldOut") : t("shop.ended.title")}
        message={ended === "offer_ended" ? t("shop.ended.body") : undefined}
        onCancel={handleEndedClose}
        actions={[{ label: t("shop.gotIt"), variant: "primary", onPress: handleEndedClose }]}
      />
    </View>
  );
};

export default PreviewContent;
