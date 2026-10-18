import { useState } from "react";

import { useServerMinute } from "@entities/app-config";
import { offerKeyOf, useShopQuery } from "@entities/item";
import type { Currency, ShopOffer } from "@entities/item";
import { useIsOnline } from "@shared/api";
import { shopCardsOf, visibleTabsOf } from "@widgets/shop-grid";
import type { ShopTabId } from "@widgets/shop-grid";

import { allItemsOf, featuredKeyOf, findOffer } from "./find-offer";

interface Shortage {
  amount: number;
  currency: Currency;
}

export const useShopScreen = () => {
  const { data: shop, isPending, refetch, dataUpdatedAt } = useShopQuery();
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const [chosenTab, setChosenTab] = useState<ShopTabId | null>(null);
  const [isOwnedHidden, setIsOwnedHidden] = useState(false);
  const [selected, setSelected] = useState<ShopOffer | null>(null);
  const [shortage, setShortage] = useState<Shortage | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  // The fresh catalog wins; an offer gone from it stays shown, so its ended dialog can finish (свежий каталог важнее; пропавшее из него предложение остаётся, чтобы диалог о завершении договорил).
  const offer =
    selected === null || shop === undefined
      ? selected
      : (findOffer(shop, offerKeyOf(selected)) ?? selected);
  const tabs = shop === undefined ? [] : visibleTabsOf(shop);
  const tab = chosenTab !== null && tabs.includes(chosenTab) ? chosenTab : (tabs[0] ?? null);
  const featured = shop?.featured ?? null;

  return {
    shop,
    isPending,
    isOnline,
    now,
    tabs,
    tab,
    cards: shop === undefined || tab === null ? [] : shopCardsOf(shop, tab, isOwnedHidden),
    featured: featured !== null && Date.parse(featured.endsAt) > now ? featured : null,
    updatedAt: dataUpdatedAt,
    isOwnedHidden,
    handleTabSelect: setChosenTab,
    handleOwnedToggle: () => setIsOwnedHidden((value) => !value),
    handleRetry: () => void refetch(),
    offer,
    items: shop === undefined ? [] : allItemsOf(shop),
    shortage,
    isEarnOpen: isEarnOpen || shortage !== null,
    handleOfferPress: setSelected,
    handleDropOpen: () => {
      if (shop === undefined || featured === null) return;
      setSelected(findOffer(shop, featuredKeyOf(featured)));
    },
    handlePreviewClose: () => setSelected(null),
    handleShortOf: (amount: number, currency: Currency) => setShortage({ amount, currency }),
    handleWalletPress: () => setIsEarnOpen(true),
    handleEarnClose: () => {
      setIsEarnOpen(false);
      setShortage(null);
    },
  };
};
