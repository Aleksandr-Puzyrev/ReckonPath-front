import { useIsMutating } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { offerKeyOf, purchaseItemMutationOptions } from "@entities/item";
import type { Currency, ShopItem, ShopOffer } from "@entities/item";
import { Sheet } from "@shared/ui/sheet";

import type { PreviewLook } from "../model/preview-look";

import PreviewContent from "./preview-content";

interface IItemPreviewSheet {
  offer: ShopOffer | null;
  items: readonly ShopItem[];
  renderBoard: (look: PreviewLook) => ReactNode;
  now: number;
  isOnline: boolean;
  onClose: () => void;
  onShortOf: (amount: number, currency: Currency) => void;
  onToast: (text: string) => void;
}

const ItemPreviewSheet = ({ offer, onClose, ...content }: IItemPreviewSheet) => {
  // A purchase in flight keeps the sheet open (идущая покупка не даёт закрыть лист).
  const isBuying = useIsMutating({ mutationKey: purchaseItemMutationOptions().mutationKey }) > 0;

  return (
    <Sheet isOpen={offer !== null} onDismiss={onClose} isDismissible={!isBuying}>
      {offer === null ? null : (
        <PreviewContent key={offerKeyOf(offer)} offer={offer} onClose={onClose} {...content} />
      )}
    </Sheet>
  );
};

export default ItemPreviewSheet;
