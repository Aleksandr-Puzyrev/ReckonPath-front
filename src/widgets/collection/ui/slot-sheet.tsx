import type { ReactNode } from "react";

import type { InventoryEntry, Loadout } from "@entities/item";
import { Sheet } from "@shared/ui/sheet";

import type { CollectionSlot } from "../model/collection-slots";

import SlotSheetContent from "./slot-sheet-content";

interface ISlotSheet {
  slot: CollectionSlot | null;
  loadout: Loadout;
  inventory: readonly InventoryEntry[];
  isOnline: boolean;
  renderBoard: (packageUrl: string | null) => ReactNode;
  onOpenShop: () => void;
  onToast: (text: string) => void;
  onClose: () => void;
}

const SlotSheet = ({ slot, onClose, ...content }: ISlotSheet) => (
  <Sheet isOpen={slot !== null} onDismiss={onClose}>
    {slot === null ? null : <SlotSheetContent slot={slot} {...content} />}
  </Sheet>
);

export default SlotSheet;
