import type { ErrorMessageKey } from "@shared/api";
import { Sheet } from "@shared/ui/sheet";

import type { SupportTopic } from "../model/use-contact-support";

import SupportForm from "./support-form";

interface ISupportSheet {
  isOpen: boolean;
  topic: SupportTopic;
  title: string;
  onSent: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
  onClose: () => void;
}

const SupportSheet = ({ isOpen, topic, title, onSent, onError, onClose }: ISupportSheet) => (
  <Sheet isOpen={isOpen} onDismiss={onClose}>
    <SupportForm topic={topic} title={title} onSent={onSent} onError={onError} />
  </Sheet>
);

export default SupportSheet;
