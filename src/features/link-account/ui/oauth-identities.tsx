import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { walletKeys } from "@entities/wallet";
import type { Me } from "@entities/wallet";
import { errorMessageKey, useIsOnline } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { oauthIdentityOptions } from "../api/oauth-mutations";
import { OAUTH_PROVIDERS, isOAuthConfigured } from "../model/oauth-provider";
import type { OAuthProvider } from "../model/oauth-provider";

interface IOAuthIdentities {
  me: Me;
}

const OAuthIdentities = ({ me }: IOAuthIdentities) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const isOnline = useIsOnline();
  const [provider, setProvider] = useState<OAuthProvider | null>(null);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<"oauth.linked" | "oauth.unlinked" | null>(null);
  const [message, setMessage] = useState<ErrorMessageKey | null>(null);
  const identities = me.identities ?? [];
  const isUnlinking = identities.some((identity) => identity.provider === provider);
  const mutation = useMutation({
    ...oauthIdentityOptions(),
    onSuccess: async (changed, action) => {
      if (changed) {
        await client.invalidateQueries({ queryKey: walletKeys.all, exact: true });
        setNotice(action.isUnlinking ? "oauth.unlinked" : "oauth.linked");
      }
      setProvider(null);
    },
    onError: (error) => setMessage(errorMessageKey(error)),
    onSettled: (): void => mutation.reset(),
  });
  const open = (next: OAuthProvider) => {
    mutation.reset();
    setNotice(null);
    setMessage(null);
    setPassword("");
    setProvider(next);
  };

  const close = () => {
    if (mutation.isPending) return;
    setPassword("");
    setProvider(null);
    mutation.reset();
  };

  const confirm = () => {
    if (provider === null || !isOnline || mutation.isPending || (me.hasPassword && password === ""))
      return;
    setMessage(null);
    mutation.mutate({ provider, isUnlinking, password });
    setPassword("");
  };

  return (
    <>
      {OAUTH_PROVIDERS.map((candidate) => {
        const linked = identities.some((identity) => identity.provider === candidate);
        if (!linked && !isOAuthConfigured(candidate)) return null;
        return (
          <Button
            key={candidate}
            label={t(linked ? "oauth.unlink" : "oauth.link", {
              provider: t(`oauth.provider.${candidate}`),
            })}
            isDisabled={!isOnline || mutation.isPending}
            onPress={() => open(candidate)}
          />
        );
      })}
      {notice !== null && (
        <Text variant="body.s" accessibilityLiveRegion="polite">
          {t(notice)}
        </Text>
      )}
      {provider !== null && (
        <Dialog
          isOpen
          title={t(isUnlinking ? "oauth.unlink" : "oauth.link", {
            provider: t(`oauth.provider.${provider}`),
          })}
          actions={[]}
          onCancel={close}
        >
          {me.hasPassword && (
            <TextField
              label={t("account.change.currentPassword")}
              value={password}
              onChangeText={setPassword}
              secureToggle={{ show: t("account.showPassword"), hide: t("account.hidePassword") }}
            />
          )}
          {message !== null && (
            <Text variant="body.s" accessibilityLiveRegion="polite">
              {t(message)}
            </Text>
          )}
          <Button
            label={t("oauth.confirm")}
            onPress={confirm}
            isDisabled={
              !isOnline || mutation.isPending || (me.hasPassword === true && password === "")
            }
          />
          <Button label={t("common.cancel")} onPress={close} isDisabled={mutation.isPending} />
        </Dialog>
      )}
    </>
  );
};

export default OAuthIdentities;
