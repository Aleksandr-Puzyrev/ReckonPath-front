import { router, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LinkSheet } from "@features/link-account";
import { useAccountStore } from "@entities/session";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

const SIGN_UP_ROUTE = "/account/sign-up";
const SIGN_IN_ROUTE = "/account/sign-in";
const TABS_SEGMENT = "(tabs)";

interface ILinkOfferHost {
  isSuspended: boolean;
}

// The offer waits for the tabs, so it never interrupts a game, and gives way to a technical sheet (предложение ждёт вкладок, чтобы не прерывать игру, и уступает техническому листу).
const LinkOfferHost = ({ isSuspended }: ILinkOfferHost) => {
  const { t } = useTranslation();
  const [segment] = useSegments();
  const offer = useAccountStore((account) => account.offer);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(
    () =>
      useAccountStore.subscribe((account, previous) => {
        if (account.linkedNotice !== previous.linkedNotice)
          setToast({ id: account.linkedNotice, text: t("account.linked") });
      }),
    [t],
  );

  const openForm = (route: typeof SIGN_UP_ROUTE | typeof SIGN_IN_ROUTE) => {
    useAccountStore.getState().closeOffer();
    router.push(route);
  };

  return (
    <>
      <LinkSheet
        isOpen={offer !== null && segment === TABS_SEGMENT && !isSuspended}
        onSignUp={() => openForm(SIGN_UP_ROUTE)}
        onSignIn={() => openForm(SIGN_IN_ROUTE)}
        onLater={useAccountStore.getState().declineOffer}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </>
  );
};

export default LinkOfferHost;
