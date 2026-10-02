import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useRef } from "react";
import { BackHandler } from "react-native";

import { styles } from "./sheet-styles";

interface ISheet {
  isOpen: boolean;
  onDismiss: () => void;
  isDismissible?: boolean;
  children: ReactNode;
}

const HIDDEN_INDEX = -1;

const Sheet = ({ isOpen, onDismiss, isDismissible = true, children }: ISheet) => {
  const ref = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isPresentedRef.current = true;
      ref.current?.present();
      return;
    }
    if (!isPresentedRef.current) return;
    isClosingRef.current = true;
    ref.current?.dismiss();
  }, [isOpen]);

  // Leaving the screen unmounts the sheet, and the library reports that as a dismissal too (уход с экрана размонтирует лист, и библиотека тоже сообщает это как закрытие).
  useEffect(
    () => () => {
      isClosingRef.current = true;
    },
    [],
  );

  const handleBack = useEffectEvent(() => {
    if (isDismissible) onDismiss();
    return true;
  });

  // Android Back closes the open sheet instead of leaving the screen (Android «Назад» закрывает открытый лист, а не уходит с экрана).
  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, [isOpen]);

  // The library calls onDismiss for every close; only a close by the user is reported (библиотека вызывает onDismiss при любом закрытии; наружу сообщается только закрытие пользователем).
  const handleDismiss = () => {
    isPresentedRef.current = false;
    if (isClosingRef.current) {
      isClosingRef.current = false;
      return;
    }
    onDismiss();
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={HIDDEN_INDEX}
      pressBehavior={isDismissible ? "close" : "none"}
    />
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      enablePanDownToClose={isDismissible}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
};

export default Sheet;
