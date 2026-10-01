import type { ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle } from "react";

interface IModal {
  onDismiss: () => void;
  children: ReactNode;
}

const lastSheet: { onDismiss: (() => void) | null } = { onDismiss: null };

// Mirrors the library: dismiss() always ends in onDismiss (как в библиотеке: dismiss() всегда завершается onDismiss).
export const BottomSheetModal = forwardRef(function MockBottomSheetModal(
  { onDismiss, children }: IModal,
  ref,
) {
  useEffect(() => {
    lastSheet.onDismiss = onDismiss;
  }, [onDismiss]);
  useImperativeHandle(ref, () => ({ present: () => undefined, dismiss: onDismiss }));
  return children;
});

export const dismissByUser = () => lastSheet.onDismiss?.();

export const BottomSheetView = ({ children }: { children: ReactNode }) => children;

export const BottomSheetBackdrop = () => null;
