import { useAccountStore } from "@entities/session";
import { useMeQuery } from "@entities/wallet";

export const useIsConsentRequired = () => {
  const hasLogin = useAccountStore((account) => account.hasLogin);
  const { data: me } = useMeQuery();
  return hasLogin && (me?.consentsRequired.length ?? 0) > 0;
};
