import type { SupportTopic } from "@entities/support";
import { Sheet } from "@shared/ui/sheet";

import type { SupportCallbacks } from "../model/use-contact-support";

import SupportForm from "./support-form";

interface ISupportSheet extends SupportCallbacks {
  isOpen: boolean;
  topic: SupportTopic;
  title: string;
  onClose: () => void;
}

const SupportSheet = ({ isOpen, topic, title, onSent, onError, onClose }: ISupportSheet) => (
  <Sheet isOpen={isOpen} onDismiss={onClose}>
    <SupportForm topic={topic} title={title} onSent={onSent} onError={onError} />
  </Sheet>
);

export default SupportSheet;
