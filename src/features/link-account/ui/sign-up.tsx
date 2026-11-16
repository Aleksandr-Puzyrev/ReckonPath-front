import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { View } from "react-native";

import { NICKNAME_MAX_LENGTH } from "@entities/wallet";
import { openPrivacyPolicy } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Checkbox } from "@shared/ui/checkbox";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { signUpSchema } from "../model/sign-up-schema";
import type { SignUpSchema } from "../model/sign-up-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useSignUp } from "../model/use-sign-up";

import FormFooter from "./form-footer";
import FormHeader from "./form-header";
import PasswordStrengthBar from "./password-strength-bar";
import { styles } from "./sign-up-styles";

interface ISignUp {
  onBack?: () => void;
  onCodeSent: (email: string, resendAfter: number) => void;
  onSignIn: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: SignUpSchema = {
  nickname: "",
  email: "",
  password: "",
  isConsentGiven: false,
  isMarketingAllowed: false,
};

const SignUp = ({ onBack, onCodeSent, onSignIn, onError }: ISignUp) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: DEFAULTS,
  });
  const signUp = useSignUp({
    onCodeSent,
    onFieldError: (field, messageKey) => setError(field, { message: messageKey }),
    onError,
  });
  const secureToggle = { show: t("account.showPassword"), hide: t("account.hidePassword") };
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.signUp.eyebrow")}
        title={t("account.signUp.title")}
        onBack={onBack}
      />
      <Controller
        control={control}
        name="nickname"
        render={({ field, fieldState }) => (
          <TextField
            testID="sign-up-nickname"
            label={t("account.signUp.nickname")}
            placeholder={t("account.signUp.nicknamePlaceholder")}
            counter={`${field.value.length} / ${NICKNAME_MAX_LENGTH}`}
            maxLength={NICKNAME_MAX_LENGTH}
            autoComplete="username-new"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            testID="sign-up-email"
            label={t("account.signUp.email")}
            keyboardType="email-address"
            autoComplete="email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            testID="sign-up-password"
            label={t("account.password")}
            autoComplete="new-password"
            secureToggle={secureToggle}
            hint={<PasswordStrengthBar password={field.value} />}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="isConsentGiven"
        render={({ field, fieldState }) => (
          <Checkbox
            testID="sign-up-consent"
            label={t("account.signUp.consent")}
            isChecked={field.value}
            onToggle={() => field.onChange(!field.value)}
            error={errorText(fieldState.error?.message)}
          >
            <Trans
              i18nKey="account.signUp.consentLinked"
              components={{
                privacy: (
                  <Text
                    testID="sign-up-privacy"
                    variant="body.m"
                    accessibilityRole="link"
                    style={styles.link}
                    onPress={openPrivacyPolicy}
                  />
                ),
              }}
            />
          </Checkbox>
        )}
      />
      <Controller
        control={control}
        name="isMarketingAllowed"
        render={({ field }) => (
          <Checkbox
            testID="sign-up-marketing"
            label={t("account.signUp.marketing")}
            isChecked={field.value}
            onToggle={() => field.onChange(!field.value)}
          />
        )}
      />
      <Button
        testID="sign-up-submit"
        label={signUp.isPending ? t("account.signUp.submitting") : t("account.signUp.submit")}
        onPress={handleSubmit(signUp.submit)}
        variant="primary"
        size="l"
        isDisabled={signUp.isPending}
      />
      <FormFooter
        question={t("account.signUp.hasAccount")}
        action={t("account.signInAction")}
        onPress={onSignIn}
      />
    </View>
  );
};

export default SignUp;
