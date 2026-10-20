import type { ErrorMessageKey } from "@shared/api";
import { Sheet } from "@shared/ui/sheet";

import AppealForm from "./appeal-form";

interface IAppealSheet {
  isOpen: boolean;
  onSent: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
  onClose: () => void;
}

const AppealSheet = ({ isOpen, onSent, onError, onClose }: IAppealSheet) => (
  <Sheet isOpen={isOpen} onDismiss={onClose}>
    <AppealForm onSent={onSent} onError={onError} />
  </Sheet>
);

export default AppealSheet;
