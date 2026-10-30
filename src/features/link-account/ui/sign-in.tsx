import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { signInSchema } from "../model/sign-in-schema";
import type { SignInSchema } from "../model/sign-in-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useSignIn } from "../model/use-sign-in";

import FormFooter from "./form-footer";
import FormHeader from "./form-header";
import { styles } from "./sign-in-styles";

interface ISignIn {
  onBack: () => void;
  onSignedIn: () => void;
  onNeedsCode: (email: string, resendAfter: number) => void;
  onSignUp: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: SignInSchema = { email: "", password: "" };

const SignIn = ({ onBack, onSignedIn, onNeedsCode, onSignUp, onError }: ISignIn) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: DEFAULTS,
  });
  const signIn = useSignIn({
    onSignedIn,
    onWrongCredentials: (messageKey) => setError("password", { message: messageKey }),
    onNeedsCode,
    onError,
  });
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.signIn.eyebrow")}
        title={t("account.signIn.title")}
        onBack={onBack}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            testID="sign-in-email"
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
            testID="sign-in-password"
            label={t("account.password")}
            placeholder={t("account.signIn.passwordPlaceholder")}
            autoComplete="current-password"
            secureToggle={{ show: t("account.showPassword"), hide: t("account.hidePassword") }}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Button
        testID="sign-in-submit"
        label={signIn.isPending ? t("account.signIn.submitting") : t("account.signIn.submit")}
        onPress={handleSubmit(signIn.submit)}
        variant="primary"
        size="l"
        isDisabled={signIn.isPending}
      />
      <FormFooter
        question={t("account.signIn.noAccount")}
        action={t("account.signUpAction")}
        onPress={onSignUp}
      />
    </View>
  );
};

export default SignIn;
