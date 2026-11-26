import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";

import { oauthLoginOptions } from "../api/oauth-mutations";
import type { OAuthConsents } from "../api/oauth-mutations";
import { OAUTH_PROVIDERS, isOAuthConfigured } from "../model/oauth-provider";

interface IOAuthSignIn {
  onSignedIn: () => void;
  onError: (key: ErrorMessageKey) => void;
  consents?: OAuthConsents;
  isDisabled: boolean;
}

const OAuthSignIn = ({ onSignedIn, onError, consents, isDisabled }: IOAuthSignIn) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const login = useMutation({
    ...oauthLoginOptions(),
    onSuccess: async (signedIn) => {
      if (!signedIn) return;
      await client.invalidateQueries();
      onSignedIn();
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return OAUTH_PROVIDERS.filter(isOAuthConfigured).map((provider) => (
    <Button
      key={provider}
      label={t(`oauth.signIn.${provider}`)}
      isDisabled={isDisabled || login.isPending || consents?.acceptTerms === false}
      onPress={() => login.mutate({ provider, ...(consents === undefined ? {} : { consents }) })}
    />
  ));
};

export default OAuthSignIn;
